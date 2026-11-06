import { z } from 'zod';

import {
  ContestConsentSchema,
  ContestPreviewTeamSchema,
  ContestRoundNotEnteredReasonSchema,
  ContestRoundStatusSchema,
  ContestWeekWindowSchema,
} from './contestRounds';
import { GroupCoinsSummarySchema } from './groupCoins';
import {
  CONTEST_MIN_MEMBERS,
  ContestCircleTeamSchema,
  ContestLeaderboardRowSchema,
  ContestResultSchema,
} from './weeklyContest';

/**
 * Weekly contest v4 (November 2026) — PARTICIPATION replaces the v3 coin economy.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything; the client renders what it is sent. This module is
 * additive: the week/contest, leaderboard, try and score shapes in
 * ./weeklyContest and the consent, coupon and calendar shapes in ./contestRounds
 * stay. The v3 round/contribution/wallet shapes in ./contestRounds are
 * deprecated and no longer served. `ContestWeekPayloadSchema` is the payload of
 * GET /contests/current.
 *
 * Rules (product decisions, final):
 *  Who may take part
 *   - A circle takes part once its coins reach CONTEST_QUALIFY_GROUP_COINS
 *     (./groupCoins) — every week from then on, nothing to pay, nothing to hold.
 *  The week (calendar unchanged: Mon 00:00 – Sat 00:00 IST registration, Saturday play,
 *  results Sunday, reminder Thursday 18:00 IST)
 *   - Every ACTIVE member of a qualified circle is asked "Play this week?" and
 *     answers YES or NO (AnswerContestWeekSchema). The answer can be changed until
 *     registration closes; no answer at close counts as NO.
 *   - One person, one circle per week: a member holds at most ONE YES across all
 *     circles. Saying YES in a second circle is refused with
 *     CONTEST_ALREADY_YES_ELSEWHERE until the app resends with `switch: true`,
 *     which withdraws the first YES. Once a circle registers with the member,
 *     the YES is LOCKED for the week (CONTEST_ANSWER_LOCKED) and every other
 *     circle sees the member as unavailable (CONTEST_LOCKED_ELSEWHERE).
 *   - The creator registers once at least CONTEST_MIN_YES members said YES
 *     (RegisterContestSchema from ./weeklyContest; teamCount ∈
 *     contestTeamOptions(yesCount)). The creator need not be YES; a creator who
 *     is not YES is not on a team. Registering locks the YES members and draws
 *     the teams (same seeded draw as v3, `previewTeams`). Members who say YES
 *     after the registration are not on a team until the creator re-registers
 *     ("update teams"); the creator is pushed CONTEST_READY_TO_REGISTER when
 *     that happens. Re-registering re-draws the teams and clears that circle's
 *     votes. The creator may cancel the registration until Saturday 00:00 IST,
 *     which unlocks the members.
 *  Players and votes
 *   - A team of exactly CONTEST_PLAYERS_PER_TEAM: everyone is a player.
 *   - A larger team: every member casts up to CONTEST_VOTES_PER_MEMBER votes for
 *     distinct teammates (self allowed, ContestPlayerVoteSchema), changeable until
 *     Saturday 00:00 IST; counts are visible, voters are not. At Saturday 00:00
 *     IST the CONTEST_PLAYERS_PER_TEAM most-voted members become the players;
 *     ties, and members with no votes, rank by who said YES first.
 *  Saturday
 *   - Each player has CONTEST_TRIES_PER_PLAYER tries (StartContestTrySchema; the
 *     server refuses non-players with CONTEST_NOT_PLAYER). The team's score is
 *     the best try of any of its players. A player who never plays simply
 *     forfeits those tries — there is no backup and no handover.
 *   - Winner, walkover, no-winner, coupon and 18+ consent rules are unchanged
 *     (./weeklyContest, ./contestRounds coupon section).
 *  Nothing here involves money, KYC or identity documents.
 */

/** Members who must say YES before the creator can register (a team needs three players). */
export const CONTEST_MIN_YES = CONTEST_MIN_MEMBERS;
/** Players per team. A team of exactly this size needs no vote. */
export const CONTEST_PLAYERS_PER_TEAM = 3;
/** Distinct teammates a member may vote for on a larger team. */
export const CONTEST_VOTES_PER_MEMBER = 3;
/** Tries each player has on Saturday. The contest stores its own value (`triesPerPlayer`). */
export const CONTEST_TRIES_PER_PLAYER = 3;

// --- Enums --------------------------------------------------------------------

/** A member's answer to "Play this week?". No answer has no row and is rendered as null. */
export enum ContestAnswerEnum {
  YES = 'YES',
  NO = 'NO',
}
export const ContestAnswerSchema = z.nativeEnum(ContestAnswerEnum);

// --- Request bodies -------------------------------------------------------------

/**
 * POST /contests/current/answers — answer, or change the answer, for this week in
 * this circle. `switch: true` moves a YES held in another circle to this one
 * (otherwise CONTEST_ALREADY_YES_ELSEWHERE, 409, with that circle's id and name).
 */
export const AnswerContestWeekSchema = z.object({
  groupId: z.string().min(1),
  answer: ContestAnswerSchema,
  switch: z.boolean().optional(),
});
export type AnswerContestWeek = z.infer<typeof AnswerContestWeekSchema>;

/**
 * POST /contests/current/votes — set (replace) the requesting member's votes for
 * who plays on their team. Teams of exactly CONTEST_PLAYERS_PER_TEAM refuse with
 * CONTEST_TEAM_NOT_VOTING. Candidates must be teammates (CONTEST_VOTE_INVALID_CANDIDATE).
 */
export const ContestPlayerVoteSchema = z.object({
  teamId: z.string().min(1),
  candidateUserIds: z
    .array(z.string().min(1))
    .min(1)
    .max(CONTEST_VOTES_PER_MEMBER)
    .refine(ids => new Set(ids).size === ids.length, 'Candidates must be distinct'),
});
export type ContestPlayerVote = z.infer<typeof ContestPlayerVoteSchema>;

// --- This week, per circle ----------------------------------------------------------

/** One ACTIVE member of the circle and their answer this week. */
export const ContestWeekMemberSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
  isCreator: z.boolean(),
  /** null = has not answered this week. */
  answer: ContestAnswerSchema.nullable(),
  answeredAt: z.coerce.date().nullable(),
  /** YES and on a team of the current registration. */
  onTeam: z.boolean(),
  /** Holds a YES in, or is locked into, ANOTHER circle this week: cannot play here. */
  unavailable: z.boolean(),
});
export type ContestWeekMember = z.infer<typeof ContestWeekMemberSchema>;

/** The requesting member's own answer state in this circle. */
export const ContestMyAnswerSchema = z.object({
  answer: ContestAnswerSchema.nullable(),
  answeredAt: z.coerce.date().nullable(),
  /** Phase REGISTRATION, circle qualified, not locked here or elsewhere. */
  canAnswer: z.boolean(),
  /** YES here and this circle registered with me: the answer cannot change this week. */
  locked: z.boolean(),
  /** My YES is in another circle: saying YES here needs `switch: true`. */
  yesElsewhereGroupId: z.string().nullable(),
  yesElsewhereGroupName: z.string().nullable(),
  /** Another circle registered with me this week: no YES here until next week. */
  lockedElsewhereGroupId: z.string().nullable(),
  lockedElsewhereGroupName: z.string().nullable(),
});
export type ContestMyAnswer = z.infer<typeof ContestMyAnswerSchema>;

/**
 * A qualified circle's participation this week (replaces the v3 `round`). The
 * four statuses are the v3 ones: OPEN (answers being collected), REGISTERED,
 * ENTERED (closed with a registration; teams and players fixed), NOT_ENTERED
 * (closed without one; see notEnteredReason: NOT_REGISTERED or TOO_FEW_YES).
 */
export const ContestParticipationSchema = z.object({
  status: ContestRoundStatusSchema,
  notEnteredReason: ContestRoundNotEnteredReasonSchema.nullable(),
  yesCount: z.number().int(),
  /** CONTEST_MIN_YES. */
  minYes: z.number().int(),
  /** YES members not on a team of the current registration (said yes after it). 0 when not registered. */
  yesAfterRegistration: z.number().int(),
  /** Chosen team count (1 until the creator picks). */
  teamCount: z.number().int(),
  /** contestTeamOptions(yesCount) from ./weeklyContest; [] below CONTEST_MIN_YES. */
  teamOptions: z.array(z.number().int()),
  registeredAt: z.coerce.date().nullable(),
  registeredByName: z.string().nullable(),
  /** Creator, phase REGISTRATION, yesCount >= minYes, status OPEN or REGISTERED. */
  canRegister: z.boolean(),
  /** Creator, status REGISTERED, phase REGISTRATION (re-register: new team count or late YES members). */
  canChangeTeams: z.boolean(),
  canCancelRegistration: z.boolean(),
  /** Every ACTIVE member, creator first, then by answer time. */
  members: z.array(ContestWeekMemberSchema),
  me: ContestMyAnswerSchema,
  /** Teams drawn at registration (seeded, stable until re-registration); empty before. */
  previewTeams: z.array(ContestPreviewTeamSchema).default([]),
});
export type ContestParticipation = z.infer<typeof ContestParticipationSchema>;

/** One member of a team with their vote count; players are flagged once fixed. */
export const ContestTeamCandidateSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
  /** Votes received so far (visible to everyone on the team; voters are not). */
  voteCount: z.number().int(),
  /** One of the team's players. Always true on a team of exactly CONTEST_PLAYERS_PER_TEAM. */
  isPlayer: z.boolean(),
  /** Player's own tries; 0 for non-players and before Saturday. */
  triesUsed: z.number().int(),
  triesLeft: z.number().int(),
  bestScore: z.number().int().nullable(),
});
export type ContestTeamCandidate = z.infer<typeof ContestTeamCandidateSchema>;

/**
 * A team this week. `triesUsed` / `triesLeft` (inherited) are the team totals
 * (players × triesPerPlayer); the per-player numbers are on `candidates`.
 */
export const ContestPlayTeamSchema = ContestCircleTeamSchema.extend({
  candidates: z.array(ContestTeamCandidateSchema),
  /** Larger teams only: votes are being collected (until Saturday 00:00 IST). */
  votingOpen: z.boolean(),
  /** Candidate ids the requesting member voted for (up to CONTEST_VOTES_PER_MEMBER). */
  myVotes: z.array(z.string()),
  /** Requesting member is on the team, votingOpen, and the team is larger than CONTEST_PLAYERS_PER_TEAM. */
  canVote: z.boolean(),
  /** When the players were fixed (Saturday 00:00 IST); null before. */
  playersFixedAt: z.coerce.date().nullable(),
  /** The requesting member is one of the team's players. */
  isPlayer: z.boolean(),
  /** isPlayer, contest LIVE, myTriesLeft > 0. */
  canPlay: z.boolean(),
  myTriesUsed: z.number().int(),
  myTriesLeft: z.number().int(),
});
export type ContestPlayTeam = z.infer<typeof ContestPlayTeamSchema>;

/** One of the requesting member's circles with at least CONTEST_MIN_MEMBERS active members. */
export const ContestCircleWeekSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  isCreator: z.boolean(),
  creatorName: z.string().nullable(),
  activeMemberCount: z.number().int(),
  coins: GroupCoinsSummarySchema,
  /** null until the circle is qualified (the card then shows the coins progress instead). */
  participation: ContestParticipationSchema.nullable(),
  /** The circle's teams this week (empty until registered), ordered by index. */
  teams: z.array(ContestPlayTeamSchema),
});
export type ContestCircleWeek = z.infer<typeof ContestCircleWeekSchema>;

/** Where the requesting member stands this week across all circles ("already playing with Ladakh trip"). */
export const ContestMyWeekSchema = z.object({
  /** The circle holding my YES this week; null when none. */
  yesGroupId: z.string().nullable(),
  yesGroupName: z.string().nullable(),
  /** The circle that registered with me this week; null until a registration locks me. */
  lockedGroupId: z.string().nullable(),
  lockedGroupName: z.string().nullable(),
});
export type ContestMyWeek = z.infer<typeof ContestMyWeekSchema>;

/**
 * GET /contests/current (v4) — this week for the requesting member. `circles`
 * holds every circle of the member with at least CONTEST_MIN_MEMBERS active
 * members; the card shows the coins progress for unqualified ones. `leaderboard`
 * is empty before Saturday. `result` is null until finalized or cancelled.
 */
export const ContestWeekPayloadSchema = z.object({
  contest: ContestWeekWindowSchema,
  me: ContestMyWeekSchema,
  circles: z.array(ContestCircleWeekSchema),
  leaderboard: z.array(ContestLeaderboardRowSchema),
  result: ContestResultSchema.nullable(),
  /** 18+ consent state of the requesting member (plan 22). */
  consent: ContestConsentSchema,
});
export type ContestWeekPayload = z.infer<typeof ContestWeekPayloadSchema>;
