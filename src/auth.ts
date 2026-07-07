/**
 * Authentication and Authorization Types
 */

import { z } from 'zod';
import { mobileNumberSchema } from './mobile';
import { otpSchema } from './otp';

// Enums for runtime values
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  USER = 'USER',
  NONE = 'NONE',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  GITHUB = 'github',
}

export enum PermissionType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

// Constants
export const AUTH_CONSTANTS = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  JWT_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// User Schema based on Prisma model
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  mobile: mobileNumberSchema,
  password: z.string(),
  name: z.string(),
  role: z.nativeEnum(UserRoleEnum),
  isActive: z.boolean().default(true),
  createdAt: z
    .union([z.string(), z.date()])
    .transform(val => (typeof val === 'string' ? new Date(val) : val)),
  updatedAt: z
    .union([z.string(), z.date()])
    .transform(val => (typeof val === 'string' ? new Date(val) : val)),
  refreshTokens: z.array(z.any()).optional(), // RefreshToken[] - you can define RefreshTokenSchema separately
  hasAppPin: z.boolean().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Create and parse User data
export const createUser = (data: unknown) => UserSchema.parse(data);
export const createUserSafe = (data: unknown) => UserSchema.safeParse(data);

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  acceptTerms: boolean;
  subscribeNewsletter?: boolean;
}

export interface RegisterResponse {
  user: Omit<User, 'refreshTokens'>;
  message: string;
  requiresVerification: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Only in development
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  platform: 'web' | 'ios' | 'android' | 'desktop';
  browser?: string;
  version?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  security: boolean;
  updates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowSearchByEmail: boolean;
  allowSearchByPhone: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  status: AuthStatus;
  isUnlocked: boolean;
}

// JWT Token Payload
export interface JWTPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// OAuth Types
export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  scope: string[];
  redirectUri: string;
}

export interface OAuthRequest {
  provider: 'google' | 'facebook' | 'apple' | 'github';
  code: string;
  state?: string;
  redirectUri: string;
}

export interface OAuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export const LoginOtpRequest = z.object({
  mobile: mobileNumberSchema,
});

export type LoginOtpRequestType = z.infer<typeof LoginOtpRequest>;
export const signupMobileVerifySchema = z.object({
  mobile: mobileNumberSchema,
  otp: otpSchema,
});

export type SignupMobileVerify = z.infer<typeof signupMobileVerifySchema>;
