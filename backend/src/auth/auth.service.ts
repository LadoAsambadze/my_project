import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';

const BCRYPT_ROUNDS = 12;

interface RefreshPayload {
  sub: string;
  email: string;
  jti: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // Public flows
  // ---------------------------------------------------------------------------

  async register(input: RegisterInput): Promise<{ user: User; tokens: Tokens }> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      password: passwordHash,
    });

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: User; tokens: Tokens }> {
    const user = await this.users.findByEmail(input.email);
    // Always run a compare to keep timing roughly constant whether or not the
    // user exists, avoiding user-enumeration via response time.
    const hash = user?.password ?? '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
    const valid = await bcrypt.compare(input.password, hash);
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  /**
   * Rotate a refresh token: verify it, revoke the old one, issue a fresh pair.
   * Throws if the token is missing/invalid/expired/revoked.
   */
  async refresh(refreshToken: string | undefined): Promise<{ user: User; tokens: Tokens }> {
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
      { sub: user.id, email: user.email },
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
