import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { OAuthProfile } from './oauth-profile';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      // Fall back to placeholders (|| also catches empty-string env values) so
      // the app boots without OAuth configured; hitting the route without real
      // credentials simply fails at Facebook.
      clientID:
        config.get<string>('FACEBOOK_APP_ID') || 'facebook-not-configured',
      clientSecret:
        config.get<string>('FACEBOOK_APP_SECRET') || 'facebook-not-configured',
      callbackURL:
        config.get<string>('FACEBOOK_CALLBACK_URL') ||
        'http://localhost:4000/auth/facebook/callback',
      scope: ['email'],
      profileFields: ['id', 'emails', 'displayName', 'photos'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: unknown, user?: OAuthProfile) => void,
  ): void {
    const result: OAuthProfile = {
      provider: 'facebook',
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      name: profile.displayName ?? null,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
    done(null, result);
  }
}
