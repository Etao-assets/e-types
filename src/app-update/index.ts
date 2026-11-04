import { z } from 'zod';

// Zod schema for app update config input
export const appUpdateConfigSchema = z.object({
  forceUpdate: z.boolean(),
  /** Plan 22: contest actions are refused until the member accepts the 18+ consent. Flip together with forceUpdate once the consent build is live. */
  contestConsentEnforced: z.boolean().default(false),
  iosVersion: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'iOS version must be in format X.Y.Z (e.g., 2.0.0)',
    ),
  androidVersion: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'Android version must be in format X.Y.Z (e.g., 2.0.0)',
    ),
  iosBuildNumber: z
    .number()
    .int()
    .positive('iOS build number must be a positive integer'),
  androidBuildNumber: z
    .number()
    .int()
    .positive('Android build number must be a positive integer'),
});

export interface AppUpdateConfigInput {
  forceUpdate: boolean;
  contestConsentEnforced?: boolean;
  iosVersion: string;
  androidVersion: string;
  iosBuildNumber: number;
  androidBuildNumber: number;
  updatedBy?: string;
}

export interface AppUpdateConfig {
  id: string;
  forceUpdate: boolean;
  contestConsentEnforced: boolean;
  iosVersion: string;
  androidVersion: string;
  iosBuildNumber: number;
  androidBuildNumber: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface AppUpdateApiResponse {
  success: boolean;
  data: AppUpdateConfig | null;
  timestamp: string;
  message: string;
  requestId?: string;
}
