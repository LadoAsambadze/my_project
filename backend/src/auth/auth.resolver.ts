import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthService, Tokens } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { VerifyEmailInput } from './dto/verify-email.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { LoginWithCodeInput } from './dto/login-with-code.input';
import { ChangePasswordInput } from './dto/change-password.input';
import { AuthPayload } from './models/auth-payload.model';
import { User } from '../users/models/user.model';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './strategies/jwt-access.strategy';
import { UsersService } from '../users/users.service';
import {
  REFRESH_COOKIE,
  setRefreshCookie,
  clearRefreshCookie,
} from './auth.cookie';

interface GqlContext {
  req: Request;
  res: Response;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Mutation(() => User, {
    description:
      'Create a new account and email a verification code. The account cannot sign in until the code is confirmed via verifyEmail.',
  })
  async register(@Args('input') input: RegisterInput): Promise<User> {
    return this.auth.register(input);
  }

  @Mutation(() => AuthPayload, {
    description:
      'Confirm the emailed verification code. On success the account is verified and signed in.',
  })
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const { user, tokens } = await this.auth.verifyEmail(input);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => Boolean, {
    description:
      'Re-send a verification code to an unverified account (rate-limited). Always returns true.',
  })
  async resendVerificationCode(
    @Args('email') email: string,
  ): Promise<boolean> {
    await this.auth.resendVerificationCode(email);
    return true;
  }

  @Mutation(() => Boolean, {
    description:
      'Email a password-reset code (rate-limited). Always returns true, even for unknown emails.',
  })
  async requestPasswordReset(
    @Args('email') email: string,
  ): Promise<boolean> {
    await this.auth.requestPasswordReset(email);
    return true;
  }

  @Mutation(() => Boolean, {
    description:
      'Confirm a reset code and set a new password. Revokes all existing sessions; the user must sign in again.',
  })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<boolean> {
    await this.auth.resetPassword(input);
    return true;
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const { user, tokens } = await this.auth.login(input);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => Boolean, {
    description:
      'Email a one-time sign-in code (rate-limited). Always returns true, even for unknown emails.',
  })
  async requestLoginCode(@Args('email') email: string): Promise<boolean> {
    await this.auth.requestLoginCode(email);
    return true;
  }

  @Mutation(() => AuthPayload, {
    description:
      'Sign in by confirming a one-time code emailed via requestLoginCode.',
  })
  async loginWithCode(
    @Args('input') input: LoginWithCodeInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const { user, tokens } = await this.auth.loginWithCode(input);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => AuthPayload, {
    description:
      'Exchange the refresh token (read from the httpOnly cookie) for a new access token, rotating the refresh token.',
  })
  async refreshToken(@Context() ctx: GqlContext): Promise<AuthPayload> {
    const current = ctx.req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const { user, tokens } = await this.auth.refresh(current);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: GqlContext): Promise<boolean> {
    const current = ctx.req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(current);
    clearRefreshCookie(ctx.res, this.config);
    return true;
  }

  @Mutation(() => Boolean, {
    description:
      "Change the signed-in user's password (confirms the current one unless the account has none).",
  })
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @CurrentUser() current: AuthenticatedUser,
    @Args('input') input: ChangePasswordInput,
  ): Promise<boolean> {
    await this.auth.changePassword(
      current.userId,
      input.currentPassword,
      input.newPassword,
    );
    return true;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() current: AuthenticatedUser): Promise<User> {
    const user = await this.users.findById(current.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  // ---------------------------------------------------------------------------
  // Token delivery
  // ---------------------------------------------------------------------------

  /**
   * Set the refresh token as an httpOnly cookie and return the access token.
   */
  private deliverTokens(
    ctx: GqlContext,
    user: AuthPayload['user'],
    tokens: Tokens,
  ): AuthPayload {
    setRefreshCookie(
      ctx.res,
      this.config,
      tokens.refreshToken,
      this.auth.refreshCookieMaxAgeMs,
    );
    return { accessToken: tokens.accessToken, user };
  }
}
