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
 *     (./groupCoins) — every week from then on.
 *   - v5 (./memberCoins): the circle's own coins pay for its first contest that
 *     starts. Afterwards a member needs CONTEST_MIN_COINS_TO_JOIN personal coins
 *     to say YES (CONTEST_LOW_COINS otherwise) and everyone on the team pays an
 *     equal share of CONTEST_ENTRY_COINS (contestMemberShare). Coins are taken
 *     only when the Saturday contest starts; nothing is held before and nothing
 *     is refunded after. `ContestEntrySchema` tells the app what to show.
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
 *     (RegisterContestSchema from ./weeklyContest). Since November 2026 a circle
 *     is never split: the whole circle plays as ONE team made of every member who
 *     said YES, named after the circle (`previewTeams` has that one team). The
 *     creator need not be YES; a creator who is not YES is not on the team.
 *     Registering locks the YES members. A member who says YES after the
 *     registration joins the team at once and is locked too (no push to anyone,
 *     no "update teams"). Registering a circle that is already registered
 *     changes nothing (the team and its votes stay). The creator may cancel the
 *     registration until Saturday 00:00 IST, which unlocks the members.
 *  Players and votes
 *   - A team of exactly CONTEST_PLAYERS_PER_TEAM: everyone is a player.
 *   - A larger team: every member casts up to CONTEST_VOTES_PER_MEMBER votes for
 *     distinct teammates (self allowed, ContestPlayerVoteSchema), changeable until
 *     Saturday 00:00 IST; counts are visible, voters are not. At Saturday 00:00
 *     IST the CONTEST_PLAYERS_PER_TEAM most-voted members become the players;
 *     ties, and members with no votes, rank by who said YES first. Voting opens
 *     as soon as the team grows past CONTEST_PLAYERS_PER_TEAM; a member who joins
 *     late has no votes and the latest YES, so ranks last until votes change it.
 *  Saturday
 *   - Each player has CONTEST_TRIES_PER_PLAYER tries (StartContestTrySchema; the
 *     server refuses non-players with CONTEST_NOT_PLAYER). The team's score is
 *     the best try of any of its players. A player who never plays simply
 *     forfeits those tries.
 *   - Passing to a backup (November 2026, PassContestSpotSchema): on a team with
 *     more than CONTEST_PLAYERS_PER_TEAM members, a CURRENT player who has not
 *     started a try may pass their spot during Saturday play. The spot goes to
 *     the next member in the vote order who is neither playing nor passed; that
 *     backup gets the full tries and a CONTEST_PLAYER_HANDOVER push (nobody else
 *     is notified). Only the player can pass their own spot, a pass is final for
 *     the week, and it is refused with CONTEST_HANDOVER_NOT_ALLOWED once they
 *     started a try or when nobody is left to take the spot (a team of exactly
 *     CONTEST_PLAYERS_PER_TEAM included). The member who passed stays on the
 *     team (and shares a won coupon); `ContestTeamCandidate.passed` marks them.
 *   - Winner, walkover, no-winner, coupon and 18+ consent rules are unchanged
 *     (./weeklyContest, ./contestRounds coupon section).
 *  The creator's weekly pick (November 2026, behind the admin switch
 *  `appUpdateConfig.contestCreatorPickEnforced`)
 *   - While the switch is ON, a circle takes part in a week only after its
 *     CREATOR picked it for that week and CONFIRMED the pick. Every creator picks
 *     one of the circles they created, every week, even with a single circle.
 *     Picking and confirming are open from Monday 00:00 IST until the stored
 *     `cancelCutoffAt` (Friday 00:00 IST, "Thursday night").
 *   - Confirming requires the circle to be ELIGIBLE: qualified
 *     (CONTEST_QUALIFY_GROUP_COINS) and at least CONTEST_MIN_MEMBERS active
 *     members. A confirmed pick is LOCKED for the week (CONTEST_PICK_LOCKED);
 *     cancelling the registration does not unlock it. Confirming opens the
 *     circle's round and pushes CONTEST_CIRCLE_SCHEDULED to its members.
 *   - A pick of a not-yet-eligible circle is SOFT: no round, no push, changeable
 *     until the deadline; when the circle becomes eligible the creator is pushed
 *     CONTEST_PICK_ELIGIBLE and confirms. A soft pick never locks on its own.
 *   - The creator's other circles are closed for the week
 *     (`ContestCircleWeek.weekState` CLOSED_OTHER_PICK); a circle whose creator
 *     has not confirmed yet is AWAITING_PICK; answering or registering there is
 *     refused with CONTEST_PICK_REQUIRED. A pick of a circle that no longer
 *     exists, or whose creator changed, is void: the creator may pick again.
 *   - Nothing carries over: every Monday starts with no pick. Monday 09:00 IST
 *     CONTEST_PICK_PROMPT and Thursday 18:00 IST CONTEST_PICK_LAST_CHANCE go to
 *     creators without a confirmed pick.
 *   - While the switch is OFF nothing above applies: rounds open automatically
 *     as before and `pick` is served with `enforced: false`.
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

/** Why a circle has no yes/no panel this week (creator pick, switch ON). */
export enum ContestCircleWeekStateEnum {
  OPEN = 'OPEN',
  AWAITING_PICK = 'AWAITING_PICK',
  CLOSED_OTHER_PICK = 'CLOSED_OTHER_PICK',
}
export const ContestCircleWeekStateSchema = z.nativeEnum(ContestCircleWeekStateEnum);

/** The creator's pick for the week. */
export enum ContestPickStateEnum {
  /** No pick this week. */
  NONE = 'NONE',
  /** Picked but not confirmed: the circle was not eligible at pick time. Changeable until the deadline. (Cancel in the confirmation dialog clears the pick instead.) */
  SOFT = 'SOFT',
  /** Confirmed: locked for the week; the circle's round is open. */
  CONFIRMED = 'CONFIRMED',
}
export const ContestPickStateSchema = z.nativeEnum(ContestPickStateEnum);

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

/**
 * POST /contests/current/passes — a current player passes their Saturday spot to
 * the next member in the vote order (teams larger than CONTEST_PLAYERS_PER_TEAM
 * only, before their first try, final). Returns the fresh ContestWeekPayload;
 * repeating it changes nothing. Refusals: CONTEST_NOT_LIVE (not Saturday play),
 * CONTEST_NOT_TEAM_MEMBER, CONTEST_NOT_PLAYER (not a current player),
 * CONTEST_HANDOVER_NOT_ALLOWED (a try already started, or nobody left), and the
 * 18+ / consent refusals shared with the other contest actions.
 */
export const PassContestSpotSchema = z.object({
  teamId: z.string().min(1),
});
export type PassContestSpot = z.infer<typeof PassContestSpotSchema>;

// --- This week, per circle ----------------------------------------------------------

/** v5: who pays a circle's contest entry in a given week. */
export enum ContestEntryPaidByEnum {
  /** The circle's own coins (its first contest that starts). */
  CIRCLE = 'CIRCLE',
  /** The members on the team, an equal share each. */
  MEMBERS = 'MEMBERS',
}
export const ContestEntryPaidBySchema = z.nativeEnum(ContestEntryPaidByEnum);

/** v5: whether a member holds enough coins to say yes. Never a balance. */
export enum ContestMemberCoinStatusEnum {
  ENOUGH = 'ENOUGH',
  LOW = 'LOW',
}
export const ContestMemberCoinStatusSchema = z.nativeEnum(ContestMemberCoinStatusEnum);

/** v5: the coins side of a circle's week, for the requesting member. */
export const ContestEntrySchema = z.object({
  /** Who pays this week: the circle while its own coins are unused, else the members. Once charged, who paid. */
  paidBy: ContestEntryPaidBySchema,
  /** CONTEST_ENTRY_COINS. */
  cost: z.number().int(),
  /** CONTEST_MIN_COINS_TO_JOIN. */
  minCoins: z.number().int(),
  /** The requesting member's own balance. */
  myCoins: z.number().int(),
  /** true when the circle pays, else myCoins >= minCoins. */
  myCoinsEnough: z.boolean(),
  /**
   * MEMBERS only: what the requesting member pays or would pay — the share for
   * the current number of yes answers (counting the member if they have not said
   * yes yet), or the charged share once `charged`. null when the circle pays.
   */
  myShare: z.number().int().nullable(),
  /** Coins were taken for this week (the contest went live). */
  charged: z.boolean(),
  chargedAt: z.coerce.date().nullable(),
  /** MEMBERS and charged: coins taken from the requesting member (0 when not on the team); null otherwise. */
  myCharged: z.number().int().nullable(),
});
export type ContestEntry = z.infer<typeof ContestEntrySchema>;

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
  /**
   * v5: ENOUGH / LOW while the members pay and the week is not yet charged;
   * null or absent otherwise (the circle pays, already charged, older server).
   */
  coinStatus: ContestMemberCoinStatusSchema.nullable().optional(),
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
  /**
   * @deprecated One team per circle since November 2026: a late YES joins the team
   * at once, so this is 0 (kept for older builds). YES members not on the team.
   */
  yesAfterRegistration: z.number().int(),
  /** @deprecated One team per circle since November 2026: always 1 for new registrations. */
  teamCount: z.number().int(),
  /** @deprecated One team per circle since November 2026: [1] once yesCount >= minYes, else []. */
  teamOptions: z.array(z.number().int()),
  registeredAt: z.coerce.date().nullable(),
  registeredByName: z.string().nullable(),
  /** Creator, phase REGISTRATION, yesCount >= minYes, status OPEN (not yet registered). */
  canRegister: z.boolean(),
  /** @deprecated One team per circle since November 2026: always false (nothing to re-register). */
  canChangeTeams: z.boolean(),
  canCancelRegistration: z.boolean(),
  /** Every ACTIVE member, creator first, then by answer time. */
  members: z.array(ContestWeekMemberSchema),
  me: ContestMyAnswerSchema,
  /** The circle's one team once registered (members in player-ranking order); empty before. */
  previewTeams: z.array(ContestPreviewTeamSchema).default([]),
  /** v5: the coins side of this week. Absent from servers older than v5. */
  entry: ContestEntrySchema.nullable().optional(),
});
export type ContestParticipation = z.infer<typeof ContestParticipationSchema>;

/** One member of a team with their vote count; players are flagged once fixed. */
export const ContestTeamCandidateSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
  /** Votes received so far (visible to everyone on the team; voters are not). */
  voteCount: z.number().int(),
  /** One of the team's players (after any passes). Always true on a team of exactly CONTEST_PLAYERS_PER_TEAM. */
  isPlayer: z.boolean(),
  /** Player's own tries; 0 for non-players and before Saturday. */
  triesUsed: z.number().int(),
  triesLeft: z.number().int(),
  bestScore: z.number().int().nullable(),
  /**
   * Passed their player spot this week (Saturday, final), so not a player any
   * more. Optional: absent (treat as false) from servers older than the pass feature.
   */
  passed: z.boolean().optional(),
  /** Short name of the member who took the spot when this member passed; null or absent otherwise. */
  passedToName: z.string().nullable().optional(),
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
  /** The requesting member is one of the team's players (after any passes). */
  isPlayer: z.boolean(),
  /** isPlayer, contest LIVE, myTriesLeft > 0. */
  canPlay: z.boolean(),
  myTriesUsed: z.number().int(),
  myTriesLeft: z.number().int(),
  /**
   * The requesting member may pass their spot now (PassContestSpotSchema): a
   * current player of a team larger than CONTEST_PLAYERS_PER_TEAM, contest LIVE,
   * no try started, not passed, and a teammate is left to take the spot.
   * Optional: absent (treat as false) from servers older than the pass feature.
   */
  canPass: z.boolean().optional(),
  /** Who would take the spot if the requesting member passed now (only when canPass); null or absent otherwise. */
  passBackupUserId: z.string().nullable().optional(),
  /** Short name of that member, for the "Pass your spot to …?" confirmation; null or absent otherwise. */
  passBackupName: z.string().nullable().optional(),
});
export type ContestPlayTeam = z.infer<typeof ContestPlayTeamSchema>;

/**
 * One of the requesting member's circles — every ACTIVE membership, including
 * circles with fewer than CONTEST_MIN_MEMBERS active members (since 2026-11-08,
 * so the app can nudge "invite N more"; before that, small circles were omitted).
 */
export const ContestCircleWeekSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  isCreator: z.boolean(),
  creatorName: z.string().nullable(),
  activeMemberCount: z.number().int(),
  /**
   * Active members still missing before the circle can take part:
   * max(0, CONTEST_MIN_MEMBERS - activeMemberCount), computed by the server.
   * 0 for every circle that is big enough. Defaults to 0 so a payload from an
   * older backend still parses.
   */
  membersNeeded: z.number().int().min(0).default(0),
  /**
   * Creator-pick state of this circle for the week (switch ON only; OPEN while
   * the switch is OFF or the circle's round exists). AWAITING_PICK: the creator
   * has not confirmed any pick yet; CLOSED_OTHER_PICK: the creator confirmed
   * another circle (`pickedGroupName`). In both cases `participation` is null
   * and the app shows an informational card instead of the yes/no panel.
   */
  weekState: ContestCircleWeekStateSchema.default(ContestCircleWeekStateEnum.OPEN),
  /** The circle the creator confirmed instead, for CLOSED_OTHER_PICK; null otherwise. */
  pickedGroupName: z.string().nullable().default(null),
  coins: GroupCoinsSummarySchema,
  /**
   * null until the circle is qualified and big enough (the card then shows the
   * coins progress, or the members nudge when `membersNeeded` > 0). A circle
   * that registered and later dropped below CONTEST_MIN_MEMBERS keeps its
   * round, so `participation` can be set while `membersNeeded` > 0.
   */
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
  /**
   * true once the member has ever been drawn onto a contest team, in any week
   * (v3 or v4). The app hides the "Create a circle" button of the how-it-works
   * explainer for such a member. Defaults to false for payloads from an older
   * backend.
   */
  playedBefore: z.boolean().default(false),
});
export type ContestMyWeek = z.infer<typeof ContestMyWeekSchema>;

// --- Creator pick (switch ON) -----------------------------------------------------

/** One circle the requesting member created, as a dropdown option. */
export const ContestPickCircleSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  /** Qualified (CONTEST_QUALIFY_GROUP_COINS) and at least CONTEST_MIN_MEMBERS active members. */
  eligible: z.boolean(),
  membersNeeded: z.number().int().min(0),
  coins: z.number().int().min(0),
  qualifyAt: z.number().int(),
  /** true for the circle currently picked (soft or confirmed). */
  picked: z.boolean(),
});
export type ContestPickCircle = z.infer<typeof ContestPickCircleSchema>;

/**
 * `ContestWeekPayload.pick` — the requesting member's creator pick for the week.
 * Served to everyone; `circles` is empty for a member who created no circle.
 * `enforced` false (switch OFF) → the app shows no dropdown and every other
 * field is informational.
 */
export const ContestPickSchema = z.object({
  enforced: z.boolean(),
  /** Picking / confirming are refused from this instant (the week's cancelCutoffAt, Friday 00:00 IST). */
  deadlineAt: z.coerce.date(),
  state: ContestPickStateSchema,
  groupId: z.string().nullable(),
  groupName: z.string().nullable(),
  confirmedAt: z.coerce.date().nullable(),
  /** Phase REGISTRATION, before the deadline, state not CONFIRMED, at least one circle. */
  canPick: z.boolean(),
  /** A SOFT pick whose circle is eligible now: the Confirm button. */
  canConfirm: z.boolean(),
  /** The circles the member created (dropdown options), name order. */
  circles: z.array(ContestPickCircleSchema),
});
export type ContestPick = z.infer<typeof ContestPickSchema>;

/**
 * POST /contests/current/pick — select (or change) the week's circle. Eligible
 * circle → the app must call confirm next (this call alone saves a SOFT pick);
 * refused CONTEST_PICK_LOCKED once confirmed, CONTEST_PICK_CLOSED after the
 * deadline, CONTEST_PICK_NOT_CREATOR for a circle the member did not create.
 * Returns the fresh ContestWeekPayload.
 */
export const PickContestCircleSchema = z.object({
  groupId: z.string().min(1),
});
export type PickContestCircle = z.infer<typeof PickContestCircleSchema>;

/**
 * POST /contests/current/pick/confirm — lock the pick for the week; opens the
 * circle's round and pushes CONTEST_CIRCLE_SCHEDULED to its members. Refused
 * CONTEST_PICK_NOT_ELIGIBLE when the circle cannot take part yet. Idempotent on
 * the same circle. DELETE /contests/current/pick clears a SOFT pick (no body).
 */
export const ConfirmContestPickSchema = PickContestCircleSchema;
export type ConfirmContestPick = PickContestCircle;

/**
 * GET /contests/current (v4) — this week for the requesting member. `circles`
 * holds every ACTIVE circle of the member, small ones included (`membersNeeded`
 * > 0); the card shows the members nudge for those, the coins progress for
 * unqualified ones. An empty `circles` means the member has no circle: the app
 * shows the how-it-works explainer instead. `leaderboard`
 * is empty before Saturday. `result` is null until finalized or cancelled.
 */
export const ContestWeekPayloadSchema = z.object({
  contest: ContestWeekWindowSchema,
  me: ContestMyWeekSchema,
  /** The creator pick (see ContestPickSchema); null from a backend without the feature. */
  pick: ContestPickSchema.nullable().default(null),
  circles: z.array(ContestCircleWeekSchema),
  leaderboard: z.array(ContestLeaderboardRowSchema),
  result: ContestResultSchema.nullable(),
  /** 18+ consent state of the requesting member (plan 22). */
  consent: ContestConsentSchema,
});
export type ContestWeekPayload = z.infer<typeof ContestWeekPayloadSchema>;
