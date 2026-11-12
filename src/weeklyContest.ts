import { z } from 'zod';

import { GroupGameKeySchema } from './groupGame';

/**
 * Weekly contest — circles (groups) compete against EACH OTHER every Saturday.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything below; the client only renders what it is sent.
 *
 * Rules (v4, November 2026 — the rule book is ./groupCoins and ./contestParticipation;
 * this file keeps the calendar, leaderboard, try and score shapes):
 *  - Coins belong to the CIRCLE and come from circle activity only (500 on
 *    creation once name, target amount and target date are set; 500 per member
 *    who joins; cap 1,500). Nothing money-, KYC- or identity-related gates the
 *    game. A circle with CONTEST_QUALIFY_GROUP_COINS coins takes part every week.
 *  - Registration: every week, Monday 00:00 – Friday 23:59:59 IST, members of a
 *    qualified circle answer "Play this week?"; the circle creator registers once
 *    CONTEST_MIN_YES said yes. Since November 2026 a circle is never split: the
 *    whole circle plays as ONE team of every member who said yes (circle vs
 *    circle), and a member who says yes after the registration joins that team at
 *    once. Cancelling is allowed until Friday ends. Registering is free. One
 *    person plays for one circle per week.
 *  - Play: Saturday 00:00 – 23:59:59 IST. Each of a team's three PLAYERS has
 *    `triesPerPlayer` tries (default CONTEST_TRIES_PER_PLAYER, stored per contest
 *    so it can change later); a try counts when it STARTS. The best try of any
 *    player is the team's score. Scores of tries started before the end are
 *    accepted until `submitGraceEndsAt` (CONTEST_SUBMIT_GRACE_MINUTES after the end).
 *  - Validity: the contest runs only if at least CONTEST_MIN_CIRCLES different
 *    circles registered (otherwise CANCELLED and refunded). Once it runs, a circle
 *    or team that does not play forfeits (walkover): the top-ranked team wins even
 *    if it is the only one that played, with any best score > 0; nobody scoring
 *    → no winner.
 *  - Winner: highest best score; a tie goes to the team that reached that score
 *    first. One coupon per week to the winning TEAM, sent by the admin and shown
 *    in the app; each member scratches to reveal it (MyContestCouponSchema in
 *    contestRounds.ts). Teams of the same circle compete as separate teams; the
 *    parent circle gets no credit.
 */

/**
 * @deprecated v4: qualification is CONTEST_QUALIFY_GROUP_COINS (./groupCoins).
 * Not read by any consumer; removed in a later cleanup.
 */
export const CONTEST_QUALIFY_COINS = 3000;
/** Minimum ACTIVE members for a circle to appear in the weekly contest, and the YES count needed to register (CONTEST_MIN_YES). */
export const CONTEST_MIN_MEMBERS = 3;
/**
 * @deprecated v4: tries are per PLAYER (CONTEST_TRIES_PER_PLAYER in
 * ./contestParticipation); the stored per-contest value is served as
 * `triesPerPlayer`. Kept so v3 consumers compile; removed in a later cleanup.
 */
export const CONTEST_DEFAULT_TRIES_PER_TEAM = 3;
/**
 * Most teams one circle could enter in a single contest (the old split). Since
 * November 2026 every circle enters as exactly one team; kept as the bound of the
 * deprecated `RegisterContestSchema.teamCount`.
 */
export const CONTEST_MAX_TEAMS = 3;
/** Different circles needed for a contest to run and for a winner to exist. */
export const CONTEST_MIN_CIRCLES = 2;
/** Minutes after the Saturday end during which started tries may still submit. */
export const CONTEST_SUBMIT_GRACE_MINUTES = 10;
/** Upper bound accepted for a single score. */
export const CONTEST_MAX_SCORE = 100_000;
/** All contest times are defined in this time zone (UTC+05:30, no DST). */
export const CONTEST_TIMEZONE = 'Asia/Kolkata';

/** Persisted lifecycle of a weekly contest. */
export enum ContestStatusEnum {
  /** Created; registration window may be open. */
  REGISTRATION = 'REGISTRATION',
  /** Saturday has started and at least CONTEST_MIN_CIRCLES circles registered. */
  LIVE = 'LIVE',
  /** Results computed (with or without a winner). Terminal. */
  FINALIZED = 'FINALIZED',
  /** Fewer than CONTEST_MIN_CIRCLES circles registered by Friday. Terminal. */
  CANCELLED = 'CANCELLED',
}
export const ContestStatusSchema = z.nativeEnum(ContestStatusEnum);

/**
 * What the app should show right now. Computed by the server from the clock and
 * the persisted status — the client never derives it.
 */
export enum ContestPhaseEnum {
  /** Monday 00:00 – Friday 23:59:59 IST: circles can register. */
  REGISTRATION = 'REGISTRATION',
  /** Saturday 00:00 – 23:59:59 IST: registered teams play. */
  LIVE = 'LIVE',
  /** Saturday has ended; results are being computed. */
  RESULTS_PENDING = 'RESULTS_PENDING',
  /** Results are out. */
  FINALIZED = 'FINALIZED',
  /** Not enough circles registered this week. */
  CANCELLED = 'CANCELLED',
}
export const ContestPhaseSchema = z.nativeEnum(ContestPhaseEnum);

/** Why a contest has no winner (null when there is one). */
export enum ContestNoWinnerReasonEnum {
  NOT_ENOUGH_CIRCLES_REGISTERED = 'NOT_ENOUGH_CIRCLES_REGISTERED',
  NOT_ENOUGH_CIRCLES_PLAYED = 'NOT_ENOUGH_CIRCLES_PLAYED',
  NO_POSITIVE_SCORE = 'NO_POSITIVE_SCORE',
}
export const ContestNoWinnerReasonSchema = z.nativeEnum(ContestNoWinnerReasonEnum);

/** A team's outcome once the contest is finalized. */
export enum ContestTeamOutcomeEnum {
  WON = 'WON',
  /** Tied with the winner's score but reached it later. */
  LOST_ON_TIE = 'LOST_ON_TIE',
  /** Played but did not win. */
  FINISHED = 'FINISHED',
  /** Registered but never started a try. */
  DID_NOT_PLAY = 'DID_NOT_PLAY',
}
export const ContestTeamOutcomeSchema = z.nativeEnum(ContestTeamOutcomeEnum);

// --- Team-split helpers ---

/**
 * @deprecated One team per circle since November 2026: neither the server nor the
 * app uses this any more. Kept for older builds; to be removed with the unused
 * team-count columns.
 *
 * Team counts the creator could choose. v4 passed the number of members who said
 * YES this week (`yesCount`); the parameter name is historical.
 *   below CONTEST_MIN_MEMBERS → [] (cannot register)
 *   3–5   → [1]          (no split question)
 *   6–10  → [1, 2]
 *   11+   → [1, 2, 3]    (never more than CONTEST_MAX_TEAMS)
 */
export const contestTeamOptions = (activeMembers: number): number[] => {
  if (!Number.isInteger(activeMembers) || activeMembers < CONTEST_MIN_MEMBERS) {
    return [];
  }
  if (activeMembers <= 5) {
    return [1];
  }
  if (activeMembers <= 10) {
    return [1, 2];
  }
  return [1, 2, 3];
};

/**
 * @deprecated One team per circle since November 2026 (see contestTeamOptions).
 *
 * Team sizes for an even split — sizes differ by at most 1, larger teams first.
 *   (9, 2) → [5, 4]   (10, 2) → [5, 5]   (7, 2) → [4, 3]   (11, 3) → [4, 4, 3]
 * Returns [] for an invalid combination.
 */
export const contestTeamSizes = (activeMembers: number, teamCount: number): number[] => {
  if (
    !Number.isInteger(activeMembers) ||
    !Number.isInteger(teamCount) ||
    teamCount < 1 ||
    activeMembers < teamCount
  ) {
    return [];
  }
  const base = Math.floor(activeMembers / teamCount);
  const extra = activeMembers % teamCount;
  return Array.from({ length: teamCount }, (_, i) => (i < extra ? base + 1 : base));
};

// --- Request bodies ---

/**
 * POST /contests/current/registrations — circle creator only, registration window
 * only, once CONTEST_MIN_YES members said yes. Registers the whole circle as ONE
 * team of every member who said yes. Registering a circle that is already
 * registered changes nothing (the team and its votes stay).
 */
export const RegisterContestSchema = z.object({
  groupId: z.string().min(1),
  /**
   * @deprecated One team per circle since November 2026: ignored by the server.
   * Optional so builds that still send a team count keep working.
   */
  teamCount: z.number().int().min(1).max(CONTEST_MAX_TEAMS).optional(),
});
export type RegisterContest = z.infer<typeof RegisterContestSchema>;

/** POST /contests/current/tries — one of the team's PLAYERS (v4), Saturday only. Uses one of the player's tries. */
export const StartContestTrySchema = z.object({
  teamId: z.string().min(1),
});
export type StartContestTry = z.infer<typeof StartContestTrySchema>;

/** POST /contests/tries/:tryId/score — the member who started the try, once. */
export const SubmitContestScoreSchema = z.object({
  score: z.number().int().min(0).max(CONTEST_MAX_SCORE),
});
export type SubmitContestScore = z.infer<typeof SubmitContestScoreSchema>;

// --- Response shapes ---

/** The week's contest and its time windows (all instants serialised as ISO UTC). */
export const ContestWindowSchema = z.object({
  id: z.string(),
  /** Monday of the contest week in IST, "YYYY-MM-DD". */
  weekKey: z.string(),
  status: ContestStatusSchema,
  phase: ContestPhaseSchema,
  gameKey: GroupGameKeySchema,
  /** @deprecated v4: same value as `triesPerPlayer`; kept for v3 consumers. */
  triesPerTeam: z.number().int(),
  /**
   * v4: tries EACH PLAYER has on Saturday (CONTEST_TRIES_PER_PLAYER unless the
   * contest stores another value). Optional only so v3 servers and clients keep
   * compiling; the v4 server always sends it and v4 clients fall back to
   * CONTEST_TRIES_PER_PLAYER when absent.
   */
  triesPerPlayer: z.number().int().optional(),
  registrationOpensAt: z.coerce.date(),
  /** Exclusive: registration is open while now < registrationClosesAt (Saturday 00:00 IST). */
  registrationClosesAt: z.coerce.date(),
  playStartsAt: z.coerce.date(),
  /** Exclusive: tries may START while now < playEndsAt (Sunday 00:00 IST). */
  playEndsAt: z.coerce.date(),
  /** Scores of tries started before playEndsAt are accepted until this instant. */
  submitGraceEndsAt: z.coerce.date(),
  /** Circles registered so far this week. */
  registeredCircleCount: z.number().int(),
  finalizedAt: z.coerce.date().nullable(),
});
export type ContestWindow = z.infer<typeof ContestWindowSchema>;

export const ContestMemberSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
});
export type ContestMember = z.infer<typeof ContestMemberSchema>;

/**
 * One team of a circle this week. Every member of the circle sees all of the
 * circle's teams (who is on which team); `isMine` marks the requesting user's.
 */
export const ContestCircleTeamSchema = z.object({
  teamId: z.string(),
  /** 1-based within its circle's registration. */
  index: z.number().int(),
  /** The circle name when not split, else "<circle> — Team <index>". */
  name: z.string(),
  /** The requesting user is on this team. */
  isMine: z.boolean(),
  members: z.array(ContestMemberSchema),
  triesUsed: z.number().int(),
  triesLeft: z.number().int(),
  bestScore: z.number().int().nullable(),
  /** Position on the leaderboard; null until the team has a score. */
  rank: z.number().int().nullable(),
  /** Set once the contest is finalized. */
  outcome: ContestTeamOutcomeSchema.nullable(),
});
export type ContestCircleTeam = z.infer<typeof ContestCircleTeamSchema>;

/** One of the requesting user's QUALIFIED circles, as the Home card renders it. */
export const ContestCircleSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  isCreator: z.boolean(),
  creatorName: z.string().nullable(),
  activeMemberCount: z.number().int(),
  /** The circle's coins (sum over ACTIVE members). */
  coins: z.number().int(),
  /** Reached CONTEST_QUALIFY_COINS at least once. Always true in this list. */
  qualified: z.boolean(),
  /** Creator, registration phase, qualified and at least CONTEST_MIN_MEMBERS active members. */
  canRegister: z.boolean(),
  /** contestTeamOptions(activeMemberCount). */
  teamOptions: z.array(z.number().int()),
  /** Pre-selected team count: last week's choice, else 1. */
  defaultTeamCount: z.number().int(),
  /** This week's registration, if any. */
  registration: z
    .object({
      teamCount: z.number().int(),
      registeredAt: z.coerce.date(),
    })
    .nullable(),
  /** All of this circle's teams this week (empty until registered), ordered by index. */
  teams: z.array(ContestCircleTeamSchema),
});
export type ContestCircle = z.infer<typeof ContestCircleSchema>;

/** One team on the live leaderboard. Ordered: best score desc, earliest first, unscored last. */
export const ContestLeaderboardRowSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  groupId: z.string(),
  groupName: z.string(),
  bestScore: z.number().int().nullable(),
  /** When the team first reached its best score (tie-break). */
  bestScoreAt: z.coerce.date().nullable(),
  /** 1-based position among teams with a score; null when unscored. */
  rank: z.number().int().nullable(),
  triesUsed: z.number().int(),
  /** The requesting user is on this team. */
  isMine: z.boolean(),
});
export type ContestLeaderboardRow = z.infer<typeof ContestLeaderboardRowSchema>;

export const ContestResultSchema = z.object({
  winner: ContestLeaderboardRowSchema.nullable(),
  noWinnerReason: ContestNoWinnerReasonSchema.nullable(),
});
export type ContestResult = z.infer<typeof ContestResultSchema>;

/**
 * GET /contests/current — this week's contest for the requesting user. `circles`
 * holds only the user's QUALIFIED circles (empty → the Home card is hidden).
 * `leaderboard` is empty before Saturday. `result` is null until finalized or
 * cancelled.
 */
export const CurrentContestResponseSchema = z.object({
  contest: ContestWindowSchema,
  circles: z.array(ContestCircleSchema),
  leaderboard: z.array(ContestLeaderboardRowSchema),
  result: ContestResultSchema.nullable(),
});
export type CurrentContestResponse = z.infer<typeof CurrentContestResponseSchema>;

/** Response of POST /contests/current/tries. */
export const StartContestTryResponseSchema = z.object({
  tryId: z.string(),
  attemptNo: z.number().int(),
  /** v4: tries left for the requesting PLAYER after this one (v3: for the team). */
  triesLeft: z.number().int(),
  /** Same as the contest's playEndsAt — the game ends the run at this instant. */
  playEndsAt: z.coerce.date(),
});
export type StartContestTryResponse = z.infer<typeof StartContestTryResponseSchema>;

/** Response of POST /contests/tries/:tryId/score. */
export const SubmitContestScoreResponseSchema = z.object({
  tryId: z.string(),
  score: z.number().int(),
  team: ContestCircleTeamSchema,
});
export type SubmitContestScoreResponse = z.infer<typeof SubmitContestScoreResponseSchema>;
