import moment from "moment";

import { Config } from ".";

export interface OAuthCredentials {
  accessToken: string;
  expires: Date;
}

export type TokenRefresher = () => Promise<OAuthCredentials>;

export type Authenticator = (config: Config) => Promise<OAuthCredentials>;

export default function getTokenRefresher(
  authenticate: Authenticator,
  config: Config
): TokenRefresher {
  let credentials: OAuthCredentials;
  return () => {
    if (isExpired(credentials)) {
      return authenticate(config).then(freshCredentials => {
        credentials = freshCredentials;
        return credentials;
      });
    }

    return Promise.resolve(credentials);
  };
}

export function createBasicAuthToken(config: Config): string {
  return Buffer.from(`${config.userId}:${config.userSecret}`).toString(
    "base64"
  );
}

function isExpired(credentials: OAuthCredentials): boolean {
  if (!credentials || !credentials.expires) {
    return true;
  }

  return moment().isAfter(credentials.expires);
}
