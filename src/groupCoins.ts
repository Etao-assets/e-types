import { z } from 'zod';

/**
 * Group coins (v4, November 2026) — coins are earned by CIRCLE ACTIVITY only.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything below; the client only renders what it is sent.
 *
 * Why v4: the client's lawyer advised that "1 coin = ₹1 invested" and coins
 * earned from investments are illegal in India. Nothing money-, KYC- or
 * identity-related may gate the game. The v3 wallet in ./contestRounds is
 * deprecated and no longer served; the week's play rules live in
 * ./contestParticipation.
 *
 * Rules (product decisions, final):
 *  - Coins belong to the CIRCLE (group), never to a member. There is no wallet,
 *    nothing is spent, nothing is refunded, and a circle's coins never decrease.
 *  - Creation credit: GROUP_COINS_CREATION_CREDIT, once per circle, the moment the
 *    circle has a name, a target amount > 0 and a target date — at creation, or
 *    later when the creator completes those goal details. Idempotent.
 *  - Join credit: GROUP_COINS_JOIN_CREDIT for every member who accepts an
 *    invitation (the creator never counts), once per member per circle: leaving
 *    and re-joining earns nothing twice. No other condition (no KYC, no
 *    investment, no account age). Join credits accrue even while the creation
 *    details are still incomplete.
 *  - Cap: a circle's coins stop at GROUP_COINS_CAP; credits beyond it are not
 *    written. Members leaving or goal edits never remove credits.
 *  - Qualification: coins >= CONTEST_QUALIFY_GROUP_COINS lets the circle take part
 *    in the weekly contest every week from then on (./contestParticipation).
 *    Permanent by construction. One CONTEST_QUALIFIED push when it happens.
 *  - Go-live: circles that exist when v4 ships are credited by the same rules.
 *
 * v5 (November 2026): a circle's coins are USED UP by its first weekly contest
 * that actually starts (`used` / `usedAt` below). What the circle earned is not
 * reduced: `coins`, `qualified` and `qualifiedAt` keep describing the earned
 * total, the cap still stops any further credit, and the circle stays qualified.
 * From then on the members pay the contest entry from their own coins
 * (./memberCoins). The "no wallet, nothing is spent" rule above describes circle
 * coins before v5.
 *
 * Plan 51 (November 2026): the Circle Coins screen also shows what the coins
 * were used for. `left` is the number the app shows for the circle (the earned
 * total until the circle's coins are used, 0 from then on) and `activity` is
 * the full list: every credit plus one CONTEST_ENTRY line for each weekly
 * contest whose coins were taken — the circle's own coins for its first
 * contest, the members' coins afterwards. Nothing new is stored for it: the
 * contest lines are read from the charge already recorded on each contest round.
 *
 * Storage (server): the existing `points_ledger` table, one row per credit with
 * `reason` = GroupCoinReasonEnum, `refType` = GroupCoinRefTypeEnum and `refId`
 * as documented on the enum, unique per (userId, refType, refId). Rows written by
 * the v3 money hooks stay in the table and are ignored by the circle total.
 */

/** Coins a circle earns once its name, target amount (> 0) and target date are all set. */
export const GROUP_COINS_CREATION_CREDIT = 500;
/** Coins a circle earns for each member (other than the creator) who accepts an invitation. */
export const GROUP_COINS_JOIN_CREDIT = 500;
/** A circle's coins never exceed this. */
export const GROUP_COINS_CAP = 1500;
/** Coins a circle needs to take part in the weekly contest. Equals the cap on purpose: qualified = capped. */
export const CONTEST_QUALIFY_GROUP_COINS = 1500;

/** `points_ledger.reason` of a v4 credit. */
export enum GroupCoinReasonEnum {
  GROUP_CREATED = 'GROUP_CREATED',
  MEMBER_JOINED = 'MEMBER_JOINED',
}
export const GroupCoinReasonSchema = z.nativeEnum(GroupCoinReasonEnum);

/**
 * `points_ledger.refType` of a v4 credit. The matching `refId`:
 *   GROUP_CREATED → the group id (userId = the creator)
 *   MEMBER_JOINED → `${groupId}:${userId}` (userId = the joiner)
 * With the table's unique (userId, refType, refId) this makes every credit idempotent.
 */
export enum GroupCoinRefTypeEnum {
  GROUP_CREATED = 'group_created',
  MEMBER_JOINED = 'member_joined',
}

// --- Pure helpers (server writes with them; client renders with them) -----------

/**
 * How many coins a credit of `credit` is actually worth for a circle that has
 * `coins` so far: the full credit below the cap, the remainder at the edge, 0 at
 * the cap. (1000, 500) → 500; (1200, 500) → 300; (1500, 500) → 0.
 */
export const groupCoinsCreditAmount = (coins: number, credit: number): number =>
  Math.max(0, Math.min(credit, GROUP_COINS_CAP - Math.max(0, coins)));

/** Progress towards qualification, 0–100, clamped. */
export const groupCoinsProgressPercent = (coins: number): number =>
  Math.max(0, Math.min(100, Math.round((Math.max(0, coins) / CONTEST_QUALIFY_GROUP_COINS) * 100)));

/**
 * Members who still have to join for the circle to qualify. `creationPending`
 * is true while the creation credit can still be earned (details incomplete);
 * that credit is then counted as coming, so the nudge does not over-ask.
 *   (0, false) → 3;  (500, false) → 2;  (0, true) → 2;  (1500, false) → 0.
 */
export const groupCoinsJoinsToQualify = (coins: number, creationPending: boolean): number => {
  const expected = Math.max(0, coins) + (creationPending ? GROUP_COINS_CREATION_CREDIT : 0);
  return Math.max(0, Math.ceil((CONTEST_QUALIFY_GROUP_COINS - expected) / GROUP_COINS_JOIN_CREDIT));
};

/**
 * Coins the circle still has: what it earned until its coins are used
 * (GroupCoinsSummarySchema.used), 0 from then on.
 *   (1000, false) → 1000;  (1500, false) → 1500;  (1500, true) → 0.
 */
export const groupCoinsLeft = (coins: number, used: boolean): number =>
  used ? 0 : Math.max(0, coins);

// --- Response shapes --------------------------------------------------------------

/** One credit line of a circle, newest first in `GroupCoinsSchema.entries`. */
export const GroupCoinEntrySchema = z.object({
  reason: GroupCoinReasonSchema,
  /** The member the credit is attributed to: the creator for GROUP_CREATED, the joiner for MEMBER_JOINED. */
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
  /** Coins actually written (cap-aware, see groupCoinsCreditAmount). */
  coins: z.number().int(),
  createdAt: z.coerce.date(),
});
export type GroupCoinEntry = z.infer<typeof GroupCoinEntrySchema>;

/** What one line of a circle's coin activity is about (plan 51). */
export enum GroupCoinActivityKindEnum {
  GROUP_CREATED = 'GROUP_CREATED',
  MEMBER_JOINED = 'MEMBER_JOINED',
  /** The coins of one weekly contest the circle played were taken. */
  CONTEST_ENTRY = 'CONTEST_ENTRY',
}
export const GroupCoinActivityKindSchema = z.nativeEnum(GroupCoinActivityKindEnum);

/**
 * Who paid a contest entry. Same values as ContestEntryPaidByEnum
 * (./contestParticipation), which cannot be imported here because that
 * module imports this one.
 */
export enum GroupCoinPaidByEnum {
  CIRCLE = 'CIRCLE',
  MEMBERS = 'MEMBERS',
}
export const GroupCoinPaidBySchema = z.nativeEnum(GroupCoinPaidByEnum);

/** One line of `GroupCoinsSchema.activity`, newest first (plan 51). */
export const GroupCoinActivitySchema = z.object({
  /** Stable within one circle: 'created', `joined:${userId}`, `contest:${contestId}` ('contest:pool' when the contest is not known). */
  id: z.string(),
  kind: GroupCoinActivityKindSchema,
  /**
   * Signed. GROUP_CREATED / MEMBER_JOINED: the coins actually written
   * (cap-aware), positive. CONTEST_ENTRY: always -CONTEST_ENTRY_COINS
   * (./memberCoins), also when the members' shares add up to less
   * (7 × 214 = 1,498).
   */
  coins: z.number().int(),
  /** The credit time; for CONTEST_ENTRY the moment the coins were taken (the contest went live). */
  at: z.coerce.date(),
  /** GROUP_CREATED / MEMBER_JOINED: the member the credit is attributed to. null for CONTEST_ENTRY. */
  userId: z.string().nullable(),
  name: z.string().nullable(),
  /** The credit is attributed to the viewer. false for CONTEST_ENTRY. */
  isMe: z.boolean(),
  /** CONTEST_ENTRY: who paid. null for a credit. */
  paidBy: GroupCoinPaidBySchema.nullable(),
  /** CONTEST_ENTRY paid by MEMBERS: the coins each paying member was charged that week. null otherwise. */
  share: z.number().int().nullable(),
});
export type GroupCoinActivity = z.infer<typeof GroupCoinActivitySchema>;

/** The short form every contest payload carries per circle (ContestCircleWeekSchema.coins). */
export const GroupCoinsSummarySchema = z.object({
  /** Capped total (0..GROUP_COINS_CAP). */
  coins: z.number().int(),
  /** GROUP_COINS_CAP, sent so the client never hardcodes it. */
  cap: z.number().int(),
  /** CONTEST_QUALIFY_GROUP_COINS. */
  qualifyAt: z.number().int(),
  /** coins >= qualifyAt. Never returns to false. */
  qualified: z.boolean(),
  /** When the circle first qualified; null until then. */
  qualifiedAt: z.coerce.date().nullable(),
  /**
   * v5: the circle's coins were used up by its first weekly contest that
   * started. `coins`, `qualified` and `qualifiedAt` do not change when that
   * happens. Absent from servers older than v5: treat as false.
   */
  used: z.boolean().optional(),
  /** v5: when the circle's coins were used; null or absent until then. */
  usedAt: z.coerce.date().nullable().optional(),
  /**
   * Plan 51: the coins the circle still has — groupCoinsLeft(coins, used).
   * This is the number the app shows as the circle's coins. Absent from
   * servers before plan 51: use groupCoinsLeft(coins, used === true).
   */
  left: z.number().int().optional(),
});
export type GroupCoinsSummary = z.infer<typeof GroupCoinsSummarySchema>;

/**
 * The full form the circle coins screen renders (GET /goals/:id/details →
 * `groupPortfolio.groupCoins`, see ./investmentGoalDetails).
 */
export const GroupCoinsSchema = GroupCoinsSummarySchema.extend({
  /** The creation credit has been written. */
  creationCredited: z.boolean(),
  /**
   * False while the circle lacks a name, a target amount > 0 or a target date.
   * The app then shows "complete the circle's name, target and date to earn
   * GROUP_COINS_CREATION_CREDIT coins" with a link to edit the goal.
   */
  creationDetailsComplete: z.boolean(),
  /** Members credited with GROUP_COINS_JOIN_CREDIT so far. */
  joinCredits: z.number().int(),
  /** groupCoinsJoinsToQualify(coins, !creationCredited && !creationDetailsComplete); 0 once qualified. */
  joinsToQualify: z.number().int(),
  entries: z.array(GroupCoinEntrySchema),
  /**
   * Plan 51: everything that happened to the circle's coins, newest first —
   * the credits of `entries` plus one CONTEST_ENTRY line per weekly contest
   * whose coins were taken. Absent from servers before plan 51: render `entries`.
   */
  activity: z.array(GroupCoinActivitySchema).optional(),
});
export type GroupCoins = z.infer<typeof GroupCoinsSchema>;
