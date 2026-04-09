import { z } from 'zod';

// Zod schema for app update config input
export const appUpdateConfigSchema = z.object({
  forceUpdate: z.boolean(),
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
  iosVersion: string;
  androidVersion: string;
  iosBuildNumber: number;
  androidBuildNumber: number;
  updatedBy?: string;
}

export interface AppUpdateConfig {
  id: string;
  forceUpdate: boolean;
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
