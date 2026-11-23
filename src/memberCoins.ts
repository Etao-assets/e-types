import { z } from 'zod';

import { GroupGameKeySchema } from './groupGame';
import { CONTEST_MIN_MEMBERS } from './weeklyContest';

/**
 * Member coins (v5, November 2026) — personal coins earned by daily activity.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything below; the client only renders what it is sent.
 *
 * Why v5: the client wants coins to be used up, so people come back every day.
 * A circle's own 1,500 coins (./groupCoins) pay for its FIRST weekly contest
 * that actually starts; after that the circle has no coins left and every member
 * who says yes pays an equal share of the entry from their own coins.
 *
 * The lawyer's rule from v4 still holds: nothing money-, KYC- or
 * identity-related earns or gates coins. Member coins come from app activity
 * only and can only be spent on the weekly contest.
 *
 * Rules (product decisions, final):
 *  - Three rewards (MemberCoinRewardEnum), MEMBER_COINS_REWARD coins each:
 *      GAME    — finishing one round of any of the three games (free play, or a
 *                Saturday contest try). One round is enough;
 *      APP_PIN — entering the correct App PIN (setting or changing a PIN does
 *                not count);
 *      LOGIN   — signing in with a one-time code, including the sign-in that
 *                completes a new account.
 *  - Each reward has its own clock: it can be earned again exactly
 *    MEMBER_COINS_REWARD_INTERVAL_HOURS after it was last earned (earned at
 *    21:00, next from 21:00 the following day). Every day of the week.
 *  - Coins never expire and have no upper limit.
 *  - A member the weekly contest is locked for as under 18
 *    (ContestConsentStatusEnum.UNDERAGE) earns nothing and has no wallet
 *    (`available: false`). Coins earned before the lock stay on the account,
 *    hidden, and count again if the lock is lifted.
 *  - Spending: only the weekly contest takes coins (./contestParticipation,
 *    `ContestEntrySchema`). Once the circle's own coins are used, a member needs
 *    CONTEST_MIN_COINS_TO_JOIN coins to say yes; the entry (CONTEST_ENTRY_COINS)
 *    is split equally between everyone on the team (contestMemberShare) and
 *    taken when the Saturday contest starts. Nothing is ever refunded.
 *
 * Storage (server): the existing `points_ledger` table, one row per reward or
 * charge with `reason` = MemberCoinReasonEnum and `refType` =
 * MemberCoinRefTypeEnum; the reward clocks live in `member_coins_state`. A
 * member's balance is the sum of ONLY these reasons: circle credits
 * (GroupCoinReasonEnum, which carry the creator's or joiner's user id) and the
 * old money rows never count.
 */

/** Coins one daily reward is worth. */
export const MEMBER_COINS_REWARD = 100;
/** Hours, counted from the moment a reward was earned, before the same reward can be earned again. */
export const MEMBER_COINS_REWARD_INTERVAL_HOURS = 24;
/** Coins one circle's weekly contest entry costs. */
export const CONTEST_ENTRY_COINS = 1500;
/** Coins a member must hold to say yes once the circle's own coins are used. */
export const CONTEST_MIN_COINS_TO_JOIN = 500;
/** Entries `MemberCoinsWalletSchema.recent` carries at most. */
export const MEMBER_COINS_RECENT_LIMIT = 30;

/** The three daily rewards. */
export enum MemberCoinRewardEnum {
  GAME = 'GAME',
  APP_PIN = 'APP_PIN',
  LOGIN = 'LOGIN',
}
export const MemberCoinRewardSchema = z.nativeEnum(MemberCoinRewardEnum);

/** `points_ledger.reason` of a personal row. Only these reasons count towards a member's balance. */
export enum MemberCoinReasonEnum {
  DAILY_GAME = 'DAILY_GAME',
  DAILY_APP_PIN = 'DAILY_APP_PIN',
  DAILY_LOGIN = 'DAILY_LOGIN',
  /** Negative: the member's share of a weekly contest entry. */
  CONTEST_SHARE = 'CONTEST_SHARE',
}
export const MemberCoinReasonSchema = z.nativeEnum(MemberCoinReasonEnum);

/**
 * `points_ledger.refType` of a personal row. The matching `refId`:
 *   daily_*       → the ISO instant the reward was granted;
 *   contest_share → the weekly contest id (one charge per member per contest).
 * With the table's unique (userId, refType, refId) a charge can never be written twice.
 */
export enum MemberCoinRefTypeEnum {
  DAILY_GAME = 'daily_game',
  DAILY_APP_PIN = 'daily_app_pin',
  DAILY_LOGIN = 'daily_login',
  CONTEST_SHARE = 'contest_share',
}

// --- Pure helpers (server decides with them; client may render with them) ---------

/** When a reward earned at `lastEarnedAt` can be earned again. */
export const memberCoinsNextRewardAt = (lastEarnedAt: Date): Date =>
  new Date(lastEarnedAt.getTime() + MEMBER_COINS_REWARD_INTERVAL_HOURS * 60 * 60 * 1000);

/**
 * What each paying member pays for one contest entry: the same amount for
 * everyone, rounded down to a whole coin, and never more than
 * CONTEST_MIN_COINS_TO_JOIN (fewer than CONTEST_MIN_MEMBERS payers still pay a
 * third each). (3) → 500; (4) → 375; (5) → 300; (7) → 214; (10) → 150.
 */
export const contestMemberShare = (payingMembers: number): number => {
  const payers = Number.isFinite(payingMembers) ? Math.floor(payingMembers) : 0;
  return Math.floor(CONTEST_ENTRY_COINS / Math.max(CONTEST_MIN_MEMBERS, payers));
};

// --- Response shapes --------------------------------------------------------------

/** One reward and its clock. */
export const MemberCoinRewardStatusSchema = z.object({
  reward: MemberCoinRewardSchema,
  /** MEMBER_COINS_REWARD. */
  coins: z.number().int(),
  availableNow: z.boolean(),
  /** null until the member first earns it. */
  lastEarnedAt: z.coerce.date().nullable(),
  /** null while `availableNow` is true. */
  nextAvailableAt: z.coerce.date().nullable(),
});
export type MemberCoinRewardStatus = z.infer<typeof MemberCoinRewardStatusSchema>;

/** One line of a member's coin history. */
export const MemberCoinEntrySchema = z.object({
  id: z.string(),
  reason: MemberCoinReasonSchema,
  /** Signed: +MEMBER_COINS_REWARD for a reward, negative for a contest share. */
  coins: z.number().int(),
  /** CONTEST_SHARE only: the circle the member played with; null otherwise. */
  groupId: z.string().nullable(),
  groupName: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type MemberCoinEntry = z.infer<typeof MemberCoinEntrySchema>;

/** `GET /coins/me` — the member's wallet. */
export const MemberCoinsWalletSchema = z.object({
  /** false: the member is locked as under 18 — no wallet is shown; every other field is zero or empty. */
  available: z.boolean(),
  balance: z.number().int(),
  /** CONTEST_MIN_COINS_TO_JOIN, sent so the client never hardcodes it. */
  minToJoin: z.number().int(),
  /** MEMBER_COINS_REWARD. */
  rewardCoins: z.number().int(),
  /** MEMBER_COINS_REWARD_INTERVAL_HOURS. */
  rewardIntervalHours: z.number().int(),
  /** GAME, APP_PIN, LOGIN in that order; empty when `available` is false. */
  rewards: z.array(MemberCoinRewardStatusSchema),
  /** Newest first, at most MEMBER_COINS_RECENT_LIMIT. */
  recent: z.array(MemberCoinEntrySchema),
});
export type MemberCoinsWallet = z.infer<typeof MemberCoinsWalletSchema>;

/** Query of `GET /coins/me/history`. */
export const MemberCoinsHistoryQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});
export type MemberCoinsHistoryQuery = z.infer<typeof MemberCoinsHistoryQuerySchema>;

/** `GET /coins/me/history` — the member's coin history, newest first. */
export const MemberCoinsHistorySchema = z.object({
  entries: z.array(MemberCoinEntrySchema),
  /** Pass as `cursor` for the next page; null when there are no more entries. */
  nextCursor: z.string().nullable(),
});
export type MemberCoinsHistory = z.infer<typeof MemberCoinsHistorySchema>;

/** Body of `POST /coins/rewards/game` — the app reports one finished game round. */
export const MemberCoinsGameRewardRequestSchema = z.object({
  gameKey: GroupGameKeySchema,
});
export type MemberCoinsGameRewardRequest = z.infer<typeof MemberCoinsGameRewardRequestSchema>;

/** Result of one reward attempt (`POST /coins/rewards/game`). */
export const MemberCoinsRewardResultSchema = z.object({
  /** false: the member is locked as under 18; nothing was written. */
  available: z.boolean(),
  /** true: the reward was granted by this call. */
  earned: z.boolean(),
  /** MEMBER_COINS_REWARD when earned, else 0. */
  coins: z.number().int(),
  balance: z.number().int(),
  /** When this reward can be earned next; null when `available` is false. */
  nextAvailableAt: z.coerce.date().nullable(),
});
export type MemberCoinsRewardResult = z.infer<typeof MemberCoinsRewardResultSchema>;
