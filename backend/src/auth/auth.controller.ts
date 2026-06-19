import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { setRefreshCookie } from './auth.cookie';
import { OAuthProfile } from './strategies/oauth-profile';

/**
 * REST endpoints for the social-login redirect flow (Passport needs the raw
 * request/response, so these live outside GraphQL). Each provider has a start
 * route that bounces the browser to the provider, and a callback route that the
 * provider redirects back to. On success we set the same httpOnly refresh cookie
 * the GraphQL flow uses and hand the access token to the frontend in the URL
 * fragment (never logged/sent to the server) for it to pick up.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleStart(): void {
    // The guard redirects to Google; this body never runs.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.finish(req, res);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookStart(): void {
    // The guard redirects to Facebook; this body never runs.
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.finish(req, res);
  }

  /** Exchange the provider profile for our tokens and redirect to the frontend. */
  private async finish(req: Request, res: Response): Promise<void> {
    const profile = req.user as OAuthProfile;
    try {
      const { tokens } = await this.auth.oauthLogin(profile);
      setRefreshCookie(
        res,
        this.config,
        tokens.refreshToken,
        this.auth.refreshCookieMaxAgeMs,
      );
      const token = encodeURIComponent(tokens.accessToken);
      res.redirect(`${this.frontendUrl()}/oauth/callback#token=${token}`);
    } catch {
      res.redirect(`${this.frontendUrl()}/oauth/callback#error=oauth`);
    }
  }

  private frontendUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL') ??
      this.config.get<string>('CORS_ORIGIN') ??
      'http://localhost:3000'
    );
  }
}
