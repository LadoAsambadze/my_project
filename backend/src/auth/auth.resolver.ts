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
    this.setRefreshCookie(ctx.res, tokens);
    return { accessToken: tokens.accessToken, user };
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') input: LoginInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const { user, tokens } = await this.auth.login(input);
    this.setRefreshCookie(ctx.res, tokens);
    return { accessToken: tokens.accessToken, user };
  }

  @Mutation(() => AuthPayload, {
    description: 'Exchange the refresh cookie for a new access token (rotates the refresh token).',
  })
  async refreshToken(@Context() ctx: GqlContext): Promise<AuthPayload> {
    const current = ctx.req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const { user, tokens } = await this.auth.refresh(current);
    this.setRefreshCookie(ctx.res, tokens);
    return { accessToken: tokens.accessToken, user };
  }

  @Mutation(() => Boolean)
  async logout(@Context() ctx: GqlContext): Promise<boolean> {
    const current = ctx.req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(current);
    this.clearRefreshCookie(ctx.res);
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
