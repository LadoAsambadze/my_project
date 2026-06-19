/** Normalized identity extracted from an OAuth provider's profile. */
export interface OAuthProfile {
  provider: 'google' | 'facebook';
  /** The provider's stable user id ("sub"). Unique per provider. */
  providerId: string;
  /** May be absent — e.g. a Facebook user who didn't grant the email scope. */
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}
