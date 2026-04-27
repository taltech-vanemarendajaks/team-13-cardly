import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service.js';

// The package does not ship TypeScript types in this repo setup.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GoogleStrategyBase = require('passport-google-oauth20').Strategy as any;

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GoogleStrategyBase,
  'google',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly auth: AuthService,
  ) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: unknown, user?: unknown) => void,
  ) {
    try {
      const email = profile?.emails?.[0]?.value as string | undefined;
      const picture = profile?.photos?.[0]?.value as string | undefined;

      if (!email || !profile?.id) {
        throw new UnauthorizedException('Google profile is missing email');
      }

      const result = await this.auth.loginWithGoogleProfile({
        googleId: profile.id,
        email,
        name: (profile.displayName as string | undefined) ?? undefined,
        picture,
      });

      done(null, result);
    } catch (error) {
      done(error);
    }
  }
}
