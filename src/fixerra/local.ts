export interface FixerraUser {
  mobile: string;
}

export interface GetSessionParams {
  userId: string;
  traceId?: string;
  /** Pre-fetched user — skips the DB lookup if provided */
  user?: FixerraUser;
}

export interface GetSessionApiResponse {
  webviewUrl: string;
}

export interface RegisterAndGetSessionApiResponse {
  /** Registration data */
  userId: string;
  mobile: string;
  fPartnerUserId: string;
  fPartnerId: string;
  referralLink?: string;
  isNewRegistration: boolean;
  /** Session data */
  webviewUrl: string;
}