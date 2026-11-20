import { z } from 'zod';

/**
 * 18+ unlock requests, shared by the API (etao-nextjs) and the mobile app
 * (etao-mobile).
 *
 * A person who answered NO to the 18+ declaration (ageDeclaration.ts) has the
 * Weekly contest locked: `ContestConsentStatusEnum.UNDERAGE` with
 * `underageReason` DECLARATION. If that answer was a mistake, they send one
 * free-text message from the locked sheet (POST /contests/age-unlock-request).
 * An admin approves or declines it on the Weekly Contests admin page:
 *   - Approve: an admin "ask again" reset. The app shows the 18+ question again
 *     and the person answers it themselves; staff never answer for them.
 *   - Decline: the person stays locked and may send a new request.
 *
 * The server owns every decision. The app only renders `consent.unlockRequest`
 * from GET /contests/current. A person locked by a date of birth on file
 * (`underageReason` DOB) cannot send a request: an approval cannot lift that
 * lock.
 */

/** Longest message a person can send with an unlock request. */
export const AGE_UNLOCK_MESSAGE_MAX = 1000;

/** Longest admin-only note saved with a decline. It is never sent to the app. */
export const AGE_UNLOCK_ADMIN_NOTE_MAX = 500;

export enum AgeUnlockRequestStatusEnum {
  /** Waiting for an admin. A person has at most one. */
  PENDING = 'PENDING',
  /** An admin approved it: the 18+ question is asked again. */
  APPROVED = 'APPROVED',
  /** An admin declined it: the person stays locked and may send a new request. */
  DECLINED = 'DECLINED',
}
export const AgeUnlockRequestStatusSchema = z.nativeEnum(AgeUnlockRequestStatusEnum);

/**
 * The requesting user's unlock-request state: `consent.unlockRequest` in
 * GET /contests/current. It is non-null only while the contest is locked by
 * the user's own NO answer (`underageReason` DECLARATION), and null or absent
 * otherwise (also on a server without the feature).
 */
export const ContestUnlockRequestSchema = z.object({
  /** true: the app may show the message box. false while a request is waiting. */
  canRequest: z.boolean(),
  /**
   * PENDING: a request is waiting for review. DECLINED: the newest request sent
   * since the current NO answer was declined (a new one may be sent). null:
   * nothing to show. APPROVED is never sent: an approval lifts the lock.
   */
  status: AgeUnlockRequestStatusSchema.nullable(),
  /** When the request behind `status` was sent; null when `status` is null. */
  requestedAt: z.coerce.date().nullable(),
  /** When that request was declined; null unless `status` is DECLINED. */
  reviewedAt: z.coerce.date().nullable(),
});
export type ContestUnlockRequest = z.infer<typeof ContestUnlockRequestSchema>;

/**
 * POST /contests/age-unlock-request body. The response is the fresh
 * GET /contests/current payload (as POST /contests/consent does), so the app
 * replaces its cache in one request. Answers 409 AGE_UNLOCK_NOT_ALLOWED when
 * the contest is not locked by the user's own NO answer, and 409
 * AGE_UNLOCK_ALREADY_PENDING while a request is waiting.
 */
export const AgeUnlockRequestCreateSchema = z.object({
  /** The person's own words: trimmed, 1 to AGE_UNLOCK_MESSAGE_MAX characters. */
  message: z
    .string()
    .trim()
    .min(1, 'Please write a message')
    .max(AGE_UNLOCK_MESSAGE_MAX, `Message must be ${AGE_UNLOCK_MESSAGE_MAX} characters or fewer`),
  appVersion: z.string().max(32).optional(),
  platform: z.enum(['android', 'ios']).optional(),
});
export type AgeUnlockRequestCreate = z.infer<typeof AgeUnlockRequestCreateSchema>;
