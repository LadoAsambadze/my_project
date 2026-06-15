import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { AuthService, Tokens } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './models/auth-payload.model';
import { User } from '../users/models/user.model';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './strategies/jwt-access.strategy';
import { UsersService } from '../users/users.service';

export const REFRESH_COOKIE = 'refresh_token';

/**
 * Native clients (Expo/React Native) have no httpOnly cookie jar, so they send
 * this header to opt into receiving the refresh token in the response body and
 * passing it back explicitly. Web clients omit it and keep the cookie flow.
 */
export const NATIVE_CLIENT_HEADER = 'x-client-platform';

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

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const { user, tokens } = await this.auth.register(input);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const { user, tokens } = await this.auth.login(input);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => AuthPayload, {
    description:
      'Exchange the refresh token for a new access token (rotates the refresh token). Web reads it from the httpOnly cookie; native clients pass the `token` argument.',
  })
  async refreshToken(
    @Context() ctx: GqlContext,
    @Args('token', { nullable: true }) token?: string,
  ): Promise<AuthPayload> {
    const current =
      token ?? (ctx.req.cookies?.[REFRESH_COOKIE] as string | undefined);
    const { user, tokens } = await this.auth.refresh(current);
    return this.deliverTokens(ctx, user, tokens);
  }

  @Mutation(() => Boolean)
  async logout(
    @Context() ctx: GqlContext,
    @Args('token', { nullable: true }) token?: string,
  ): Promise<boolean> {
    const current =
      token ?? (ctx.req.cookies?.[REFRESH_COOKIE] as string | undefined);
    await this.auth.logout(current);
    if (!this.isNativeClient(ctx)) {
      this.clearRefreshCookie(ctx.res);
    }
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

  private isNativeClient(ctx: GqlContext): boolean {
    return ctx.req.headers[NATIVE_CLIENT_HEADER] === 'native';
  }

  /**
   * Hand the refresh token to the client in the way that client can use:
   * native gets it in the response body, web gets the httpOnly cookie.
   */
  private deliverTokens(
    ctx: GqlContext,
    user: AuthPayload['user'],
    tokens: Tokens,
  ): AuthPayload {
    if (this.isNativeClient(ctx)) {
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    }
    this.setRefreshCookie(ctx.res, tokens);
    return { accessToken: tokens.accessToken, user };
  }

  // ---------------------------------------------------------------------------
  // Cookie helpers
  // ---------------------------------------------------------------------------

  private setRefreshCookie(res: Response, tokens: Tokens): void {
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/graphql',
      maxAge: this.auth.refreshCookieMaxAgeMs,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/graphql',
    });
  }
}
