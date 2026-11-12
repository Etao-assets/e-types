import { z } from 'zod';

/**
 * 18+ self-declaration ("Are you 18 or older?") shared by the API (etao-nextjs)
 * and the mobile app (etao-mobile).
 *
 * The app asks the question once per account, right before Home (after sign-up,
 * after login, after PIN unlock), and sends the answer only after a second
 * confirmation screen. The server records every final answer (append-only
 * `age_declarations` rows) and owns whether the pop-up is still required: the
 * app only renders `user.ageDeclaration`.
 *
 * A NO locks the Weekly contest (`ContestConsentStatusEnum.UNDERAGE` with
 * `underageReason` DECLARATION). A saved answer cannot be changed by the user;
 * an admin "ask again" reset makes the pop-up required again.
 */

/** Bump when the pop-up wording changes: every user is asked again. */
export const AGE_DECLARATION_VERSION = '1.0';

export enum AgeDeclarationAnswerEnum {
  /** "Yes, I'm 18 or older" (confirmed on the second screen). */
  YES = 'YES',
  /** "No, I'm under 18" (confirmed on the second screen): the Weekly contest is locked. */
  NO = 'NO',
}
export const AgeDeclarationAnswerSchema = z.nativeEnum(AgeDeclarationAnswerEnum);

/** Where the app asked the question; stored with the answer as context. */
export enum AgeDeclarationSourceEnum {
  /** Right after sign-up (OTP verified, PIN created). */
  SIGNUP = 'SIGNUP',
  /** After an OTP login (for example on a new phone). */
  LOGIN = 'LOGIN',
  /** After the App PIN on a cold start. */
  PIN_UNLOCK = 'PIN_UNLOCK',
}
export const AgeDeclarationSourceSchema = z.nativeEnum(AgeDeclarationSourceEnum);

/**
 * The requesting user's declaration state: `user.ageDeclaration` on the login /
 * verify-signup responses and GET /auth/me, and the data of
 * POST /user/age-declaration.
 */
export const AgeDeclarationStatusSchema = z.object({
  /** true → the app must show the pop-up before Home. */
  required: z.boolean(),
  /** The saved answer for `version`; null when not answered yet or after an admin reset. */
  answer: AgeDeclarationAnswerSchema.nullable(),
  /** The AGE_DECLARATION_VERSION the server currently expects; the app echoes it in the request. */
  version: z.string(),
  /** When the saved answer was recorded; null when `answer` is null. */
  declaredAt: z.coerce.date().nullable(),
});
export type AgeDeclarationStatus = z.infer<typeof AgeDeclarationStatusSchema>;

/**
 * POST /user/age-declaration body, sent only after the second confirmation
 * screen. A stale `version` answers 409 AGE_DECLARATION_STALE; a different
 * answer while one is saved answers 409 AGE_DECLARATION_ALREADY_ANSWERED (the
 * same answer again returns the saved status and writes nothing).
 */
export const AgeDeclarationRequestSchema = z.object({
  answer: AgeDeclarationAnswerSchema,
  version: z.string(),
  source: AgeDeclarationSourceSchema,
  appVersion: z.string().max(32).optional(),
  platform: z.enum(['android', 'ios']).optional(),
});
export type AgeDeclarationRequest = z.infer<typeof AgeDeclarationRequestSchema>;
