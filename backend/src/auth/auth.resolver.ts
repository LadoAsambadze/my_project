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
