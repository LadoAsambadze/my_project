import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { VerifyEmailInput } from './dto/verify-email.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { LoginWithCodeInput } from './dto/login-with-code.input';
import { OAuthProfile } from './strategies/oauth-profile';

const BCRYPT_ROUNDS = 12;

// Email verification code settings.
const CODE_EXPIRY_MS = 15 * 60_000; // 15 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000; // 1 minute between (re)sends

interface RefreshPayload {
  sub: string;
  email: string;
  jti: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/** The unique-where clause to look a user up by this provider's id. */
function providerWhere(profile: OAuthProfile): Prisma.UserWhereUniqueInput {
  return profile.provider === 'google'
    ? { googleId: profile.providerId }
    : { facebookId: profile.providerId };
}

/** The column to set when linking this provider to a user. */
function providerData(
  profile: OAuthProfile,
): { googleId: string } | { facebookId: string } {
  return profile.provider === 'google'
    ? { googleId: profile.providerId }
    : { facebookId: profile.providerId };
}

/**
 * Split a provider's single display name ("Ada Lovelace") into first and last
 * name. Everything after the first whitespace-separated token becomes the last
 * name; either part may be null when the provider gave us nothing usable.
 */
function splitName(full: string | null): {
  firstName: string | null;
  lastName: string | null;
} {
  const parts = full?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return { firstName: null, lastName: null };
  const [firstName, ...rest] = parts;
  return { firstName, lastName: rest.length ? rest.join(' ') : null };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  // ---------------------------------------------------------------------------
  // Public flows
  // ---------------------------------------------------------------------------

  /**
   * Create an unverified account and email a verification code. No session is
   * issued — the user must confirm the code via verifyEmail() before they can
   * sign in.
   */
  async register(input: RegisterInput): Promise<User> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Handles are case-insensitive: store and compare lowercased.
    const username = input.username.toLowerCase();
    if (await this.users.findByUsername(username)) {
      throw new ConflictException('This username is already taken');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: input.email,
      username,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: new Date(input.birthDate),
      password: passwordHash,
    });

    await this.issueVerificationCode(user);
    return user;
  }

  /**
   * Confirm an emailed verification code. On success the account is marked
   * verified, the code is consumed, and a session is issued (the user is now
   * signed in).
   */
  async verifyEmail(
    input: VerifyEmailInput,
  ): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.users.findByEmail(input.email);
    // Generic message throughout so we don't reveal which emails are registered.
    if (!user) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (user.isVerified) {
      throw new BadRequestException('This email is already verified');
    }

    const record = await this.prisma.emailVerification.findUnique({
      where: { userId: user.id },
    });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new BadRequestException(
        'Too many incorrect attempts. Request a new code.',
      );
    }

    const matches = await bcrypt.compare(input.code, record.codeHash);
    if (!matches) {
      await this.prisma.emailVerification.update({
        where: { userId: user.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Success: mark verified, consume the code, and sign the user in.
    const verified = await this.users.update(user.id, { isVerified: true });
    await this.prisma.emailVerification.delete({ where: { userId: user.id } });
    const tokens = await this.issueTokens(verified);
    return { user: verified, tokens };
  }

  /**
   * Re-send a verification code for an unverified account. Silently succeeds
   * for unknown/already-verified emails (no user enumeration). Rate-limited.
   */
  async resendVerificationCode(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || user.isVerified) return;

    const existing = await this.prisma.emailVerification.findUnique({
      where: { userId: user.id },
    });
    if (
      existing &&
      Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new BadRequestException(
        'Please wait a moment before requesting another code',
      );
    }

    await this.issueVerificationCode(user);
  }

  /** Generate a 6-digit code, store its hash, and email it (upserting any prior). */
  private async issueVerificationCode(user: User): Promise<void> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

    await this.prisma.emailVerification.upsert({
      where: { userId: user.id },
      create: { userId: user.id, codeHash, expiresAt },
      // createdAt is refreshed so the resend cooldown measures from this issue.
      update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
    });

    await this.mail.sendVerificationCode(user.email, code);
  }

  // ---------------------------------------------------------------------------
  // Password reset
  // ---------------------------------------------------------------------------

  /**
   * Email a password-reset code. Silently succeeds for unknown emails or
   * OAuth-only accounts (no password to reset) so we don't reveal which emails
   * are registered. Rate-limited like the verification code.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.password) return;

    const existing = await this.prisma.passwordReset.findUnique({
      where: { userId: user.id },
    });
    if (
      existing &&
      Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new BadRequestException(
        'Please wait a moment before requesting another code',
      );
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);
    await this.prisma.passwordReset.upsert({
      where: { userId: user.id },
      create: { userId: user.id, codeHash, expiresAt },
      update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
    });

    await this.mail.sendPasswordResetCode(user.email, code);
  }

  /**
   * Confirm a reset code and set a new password. All existing sessions are
   * revoked so a leaked old token can't be used after a reset. The user is not
   * auto-signed-in — they sign in again with the new password.
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await this.users.findByEmail(input.email);
    // Generic errors throughout — no user enumeration.
    if (!user) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const record = await this.prisma.passwordReset.findUnique({
      where: { userId: user.id },
    });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset code');
    }
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new BadRequestException(
        'Too many incorrect attempts. Request a new code.',
      );
    }

    const matches = await bcrypt.compare(input.code, record.codeHash);
    if (!matches) {
      await this.prisma.passwordReset.update({
        where: { userId: user.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
    await this.users.update(user.id, { password: passwordHash });
    await this.prisma.passwordReset.delete({ where: { userId: user.id } });
    // Revoke every active session for this user.
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Change the signed-in user's password. Accounts that already have a password
   * must confirm the current one; OAuth-only accounts (no password yet) can set
   * one without it.
   */
  async changePassword(
    userId: string,
    currentPassword: string | undefined,
    newPassword: string,
  ): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (user.password) {
      const ok = currentPassword
        ? await bcrypt.compare(currentPassword, user.password)
        : false;
      if (!ok) {
        throw new BadRequestException('Current password is incorrect');
      }
    }
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.users.update(userId, { password: passwordHash });
  }

  // ---------------------------------------------------------------------------
  // Passwordless login (email one-time code)
  // ---------------------------------------------------------------------------

  /**
   * Email a one-time sign-in code. Silently succeeds for unknown or disabled
   * accounts (no enumeration). Works for any account with an email, including
   * OAuth-only ones with no password. Rate-limited.
   */
  async requestLoginCode(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) return;

    const existing = await this.prisma.loginCode.findUnique({
      where: { userId: user.id },
    });
    if (
      existing &&
      Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new BadRequestException(
        'Please wait a moment before requesting another code',
      );
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);
    await this.prisma.loginCode.upsert({
      where: { userId: user.id },
      create: { userId: user.id, codeHash, expiresAt },
      update: { codeHash, expiresAt, attempts: 0, createdAt: new Date() },
    });

    await this.mail.sendLoginCode(user.email, code);
  }

  /**
   * Confirm a sign-in code and issue a session. Proving email ownership also
   * marks the account verified.
   */
  async loginWithCode(
    input: LoginWithCodeInput,
  ): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.users.findByEmail(input.email);
    // Generic errors — no enumeration.
    if (!user) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled');
    }

    const record = await this.prisma.loginCode.findUnique({
      where: { userId: user.id },
    });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new BadRequestException(
        'Too many incorrect attempts. Request a new code.',
      );
    }

    const matches = await bcrypt.compare(input.code, record.codeHash);
    if (!matches) {
      await this.prisma.loginCode.update({
        where: { userId: user.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid or expired code');
    }

    // Success: consume the code, verify the email if needed, and sign in.
    await this.prisma.loginCode.delete({ where: { userId: user.id } });
    const signedIn = user.isVerified
      ? user
      : await this.users.update(user.id, { isVerified: true });
    const tokens = await this.issueTokens(signedIn);
    return { user: signedIn, tokens };
  }

  async login(input: LoginInput): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.users.findByEmail(input.email);
    // Always run a compare to keep timing roughly constant whether or not the
    // user exists, avoiding user-enumeration via response time.
    const hash =
      user?.password ??
      '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
    const valid = await bcrypt.compare(input.password, hash);
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before signing in',
      );
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled');
    }

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  /**
   * Sign a user in from a verified OAuth provider profile. Reconnects a known
   * social account, links a new provider to an existing account that shares the
   * email, or creates a brand new (passwordless) account.
   */
  async oauthLogin(
    profile: OAuthProfile,
  ): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.resolveOAuthUser(profile);
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled');
    }
    return { user, tokens: await this.issueTokens(user) };
  }

  /** Find, link, or create the user behind a verified OAuth profile. */
  private async resolveOAuthUser(profile: OAuthProfile): Promise<User> {
    // 1. Returning user: match the provider id we stored on a previous login.
    const byProviderId = await this.prisma.user.findUnique({
      where: providerWhere(profile),
    });
    if (byProviderId) return byProviderId;

    const { email } = profile;
    if (!email) {
      throw new UnauthorizedException(
        'Your social account did not share an email address, which is required to sign in.',
      );
    }

    // 2. Link this provider to the existing account with the same email (so
    // password and social logins resolve to one user), or 3. create a new one.
    // OAuth accounts start verified — the provider already confirmed the email.
    const existing = await this.users.findByEmail(email);
    if (existing) return this.linkProvider(existing, profile);

    const { firstName, lastName } = splitName(profile.name);
    return this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        avatarUrl: profile.avatarUrl,
        isVerified: true,
        ...providerData(profile),
      },
    });
  }

  /** Store the provider id on an existing user, backfilling name/avatar. */
  private linkProvider(user: User, profile: OAuthProfile): Promise<User> {
    const data: Prisma.UserUpdateInput = { ...providerData(profile) };
    const { firstName, lastName } = splitName(profile.name);
    if (!user.firstName && firstName) data.firstName = firstName;
    if (!user.lastName && lastName) data.lastName = lastName;
    if (!user.avatarUrl && profile.avatarUrl) data.avatarUrl = profile.avatarUrl;
    return this.users.update(user.id, data);
  }

  /**
   * Rotate a refresh token: verify it, revoke the old one, issue a fresh pair.
   * Throws if the token is missing/invalid/expired/revoked.
   */
  async refresh(
    refreshToken: string | undefined,
  ): Promise<{ user: User; tokens: Tokens }> {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() < Date.now() ||
      stored.userId !== payload.sub
    ) {
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    const matches = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!matches) {
      // Token does not match the stored hash — treat as compromised: revoke it.
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been disabled');
    }

    // Rotate: revoke the used token, then issue a brand new pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  /** Revoke the session tied to this refresh token (best effort). */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Invalid token — nothing to revoke.
    }
  }

  /** Cookie max-age (ms) for the refresh token, derived from its JWT lifetime. */
  get refreshCookieMaxAgeMs(): number {
    return this.durationToMs(
      this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
    );
  }

  // ---------------------------------------------------------------------------
  // Token helpers
  // ---------------------------------------------------------------------------

  private async issueTokens(user: User): Promise<Tokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        // jsonwebtoken accepts a number of seconds for expiresIn.
        expiresIn: this.durationToSeconds(
          this.config.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN'),
        ),
      },
    );

    const refreshToken = await this.issueRefreshToken(user);
    return { accessToken, refreshToken };
  }

  private async issueRefreshToken(user: User): Promise<string> {
    const expiresInSec = this.refreshCookieMaxAgeMs / 1000;
    const expiresAt = new Date(Date.now() + this.refreshCookieMaxAgeMs);

    // Create the row first so its id can be embedded as the token's `jti`,
    // letting us look the row up on refresh without querying by (salted) hash.
    const row = await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: 'pending', expiresAt },
    });

    const token = await this.jwt.signAsync(
      { sub: user.id, email: user.email, jti: row.id },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: expiresInSec,
      },
    );

    const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS);
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { tokenHash },
    });

    return token;
  }

  private durationToSeconds(value: string): number {
    return Math.floor(this.durationToMs(value) / 1000);
  }

  /** Parse durations like "15m", "7d", "3600s", "12h" into milliseconds. */
  private durationToMs(value: string): number {
    const match = /^(\d+)\s*(ms|s|m|h|d)?$/.exec(value.trim());
    if (!match) {
      throw new Error(`Invalid duration: ${value}`);
    }
    const amount = Number(match[1]);
    const unit = match[2] ?? 'ms';
    const unitMs: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return amount * unitMs[unit];
  }
}
