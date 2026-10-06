import { z } from 'zod';

/**
 * Group game — "play a game to win a coupon" for group investment goals.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything below; the client only renders what it is sent.
 *
 * Lifecycle:
 *   1. A coin-enabled group crosses the 50% coin gate (`isCoinsEligible`).
 *   2. The group creator picks a mode (a team size) and a game. That opens a
 *      tournament whose round 1 (kind MAIN) runs for GROUP_GAME_WINDOW_HOURS.
 *      The creator may change mode/game until the first score is submitted.
 *   3. Every ACTIVE member gets GROUP_GAME_TRIES_PER_MEMBER tries per round;
 *      the best try counts. Team score = sum of its members' best tries. A
 *      member who never plays scores 0. Team size 1 is free-for-all.
 *   4. When the window ends the round closes and the highest team wins. A tie
 *      among the top teams opens a REMATCH round for the tied teams only
 *      (fresh tries, fresh window), at most GROUP_GAME_MAX_REMATCHES times; a
 *      tie that survives is broken by the earliest-submitted best score.
 *   5. `winnerTeam` is set and the tournament is CLOSED. Coupon delivery
 *      happens outside the app.
 *
 * Team membership is stored explicitly and assignment is RANDOM in v1 so a
 * later self-pick flow, or bracket rounds, can be added without changing the
 * meaning of any field here.
 */

/** Fewer ACTIVE members than this: the group earns no coins and cannot play. */
export const GROUP_GAME_MIN_MEMBERS = 3;
/** Tries each member gets per round. The best one counts. */
export const GROUP_GAME_TRIES_PER_MEMBER = 3;
/** Length of a round, from the moment it opens. */
export const GROUP_GAME_WINDOW_HOURS = 72;
/** Rematch rounds allowed after the MAIN round before the tie-break rule applies. */
export const GROUP_GAME_MAX_REMATCHES = 2;

export enum GroupGameKeyEnum {
  GAPWING = 'GAPWING',
}
export const GroupGameKeySchema = z.nativeEnum(GroupGameKeyEnum);

export enum GroupGameStatusEnum {
  /** A round is open, or a rematch is pending. */
  OPEN = 'OPEN',
  /** Winner decided. Terminal. */
  CLOSED = 'CLOSED',
}
export const GroupGameStatusSchema = z.nativeEnum(GroupGameStatusEnum);

export enum GroupGameRoundKindEnum {
  MAIN = 'MAIN',
  REMATCH = 'REMATCH',
}
export const GroupGameRoundKindSchema = z.nativeEnum(GroupGameRoundKindEnum);

export enum GroupGameRoundStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}
export const GroupGameRoundStatusSchema = z.nativeEnum(GroupGameRoundStatusEnum);

export enum GroupGameTeamAssignmentEnum {
  /** Server shuffles ACTIVE members into teams. The only method in v1. */
  RANDOM = 'RANDOM',
}
export const GroupGameTeamAssignmentSchema = z.nativeEnum(
  GroupGameTeamAssignmentEnum,
);

// --- Mode helpers (used by the server to validate and by the client to render) ---

/**
 * Team sizes the creator may pick for `activeMembers` members: every proper
 * divisor of the count, ascending. 1 is free-for-all and is always first.
 * Below GROUP_GAME_MIN_MEMBERS there is no mode at all.
 *
 *   3 → [1]        4 → [1, 2]        6 → [1, 2, 3]
 *   8 → [1, 2, 4]  9 → [1, 3]       12 → [1, 2, 3, 4, 6]
 */
export const groupGameTeamSizes = (activeMembers: number): number[] => {
  if (!Number.isInteger(activeMembers) || activeMembers < GROUP_GAME_MIN_MEMBERS) {
    return [];
  }
  const sizes: number[] = [];
  for (let size = 1; size < activeMembers; size++) {
    if (activeMembers % size === 0) {
      sizes.push(size);
    }
  }
  return sizes;
};

/**
 * Display label for a mode: "1 vs 1 vs 1" for free-for-all among 3, "3 vs 3"
 * for six members split in two. More than three teams is abbreviated with an
 * ellipsis ("2 vs 2 vs 2…") so the tile stays readable.
 */
export const groupGameModeLabel = (
  teamSize: number,
  activeMembers: number,
): string => {
  const teams =
    teamSize > 0 && activeMembers % teamSize === 0
      ? activeMembers / teamSize
      : 0;
  if (teams <= 0) {
    return `${teamSize} vs ${teamSize}`;
  }
  if (teams > 3) {
    return `${teamSize} vs ${teamSize} vs ${teamSize}…`;
  }
  return Array.from({ length: teams }, () => String(teamSize)).join(' vs ');
};

// --- Request bodies ---

/**
 * POST /community-goals/groups/:id/game — creator only. Creates the tournament,
 * or replaces mode/game while no score has been submitted yet (which also
 * reshuffles the teams and restarts the window).
 */
export const SelectGroupGameSchema = z.object({
  /** Must be one of `groupGameTeamSizes(activeMembersCount)`. */
  teamSize: z.number().int().min(1),
  gameKey: GroupGameKeySchema,
});
export type SelectGroupGame = z.infer<typeof SelectGroupGameSchema>;

/**
 * POST /community-goals/groups/:id/game/scores — any participant of the
 * current OPEN round with tries left. One request per try; the server assigns
 * the attempt number.
 */
export const SubmitGroupGameScoreSchema = z.object({
  score: z.number().int().min(0).max(100_000),
});
export type SubmitGroupGameScore = z.infer<typeof SubmitGroupGameScoreSchema>;

// --- Response shapes ---

/** One member's standing within one round. */
export const GroupGameParticipantSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  /** Best try in this round; null until the member has played. */
  bestScore: z.number().int().nullable(),
  triesUsed: z.number().int(),
  triesLeft: z.number().int(),
  /** True for the requesting user. */
  isMe: z.boolean(),
});
export type GroupGameParticipant = z.infer<typeof GroupGameParticipantSchema>;

/** One team's standing within one round. Team ids are stable across rounds. */
export const GroupGameTeamSchema = z.object({
  id: z.string(),
  /** 1-based; "Team 1", "Team 2", … */
  index: z.number().int(),
  name: z.string(),
  /** Sum of members' best tries in this round (a member who never played adds 0). */
  totalScore: z.number().int(),
  /** 1 = leading. Ties share a rank. */
  rank: z.number().int(),
  /** True when the requesting user is on this team. */
  isMine: z.boolean(),
  members: z.array(GroupGameParticipantSchema),
});
export type GroupGameTeam = z.infer<typeof GroupGameTeamSchema>;

export const GroupGameRoundSchema = z.object({
  roundNo: z.number().int(),
  kind: GroupGameRoundKindSchema,
  status: GroupGameRoundStatusSchema,
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  /** Only the teams taking part in this round (a REMATCH holds the tied teams). */
  teams: z.array(GroupGameTeamSchema),
});
export type GroupGameRound = z.infer<typeof GroupGameRoundSchema>;

export const GroupGameTournamentSchema = z.object({
  id: z.string(),
  gameKey: GroupGameKeySchema,
  teamSize: z.number().int(),
  /** `groupGameModeLabel(teamSize, memberCount)` rendered server-side. */
  modeLabel: z.string(),
  teamAssignment: GroupGameTeamAssignmentSchema,
  status: GroupGameStatusSchema,
  /** True once any score exists — the creator can no longer change mode/game. */
  isLocked: z.boolean(),
  selectedByUserId: z.string(),
  selectedAt: z.coerce.date(),
  currentRoundNo: z.number().int(),
  /** All rounds, ascending by roundNo. The last one is the current round. */
  rounds: z.array(GroupGameRoundSchema),
  /** Set when CLOSED. Taken from the final round's standings. */
  winnerTeam: GroupGameTeamSchema.nullable(),
  closedAt: z.coerce.date().nullable(),
});
export type GroupGameTournament = z.infer<typeof GroupGameTournamentSchema>;

/**
 * The `game` block of the goal-details response. Present only for a
 * coin-enabled group goal that has crossed the coin gate; undefined otherwise.
 * `tournament` is null until the creator has selected a mode and a game.
 */
export const GroupGameStateSchema = z.object({
  minMembers: z.number().int(),
  triesPerMember: z.number().int(),
  windowHours: z.number().int(),
  /** `groupGameTeamSizes(activeMembersCount)`; empty below `minMembers`. */
  availableTeamSizes: z.array(z.number().int()),
  availableGames: z.array(GroupGameKeySchema),
  /** Requesting user is the creator and the tournament is absent or not locked. */
  canSelect: z.boolean(),
  /** Requesting user is in the current OPEN round, inside the window, with tries left. */
  canPlay: z.boolean(),
  myTriesLeft: z.number().int(),
  tournament: GroupGameTournamentSchema.nullable(),
});
export type GroupGameState = z.infer<typeof GroupGameStateSchema>;
