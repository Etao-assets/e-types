import { z } from 'zod';

import {
  CONTEST_MAX_TEAMS,
  ContestCircleTeamSchema,
  ContestLeaderboardRowSchema,
  ContestResultSchema,
  ContestWindowSchema,
  RegisterContestSchema,
} from './weeklyContest';

/**
 * Weekly contest v3 — coins are a WALLET, entering COSTS coins, members CONTRIBUTE.
 *
 * Shared contract between etao-nextjs (server) and etao-mobile (client). The
 * server decides everything; the client renders what it is sent. This module is
 * additive: the week/contest, leaderboard, try and score shapes in
 * `./weeklyContest` stay as they are; the circle/registration shapes there are
 * superseded by the ones here (`ContestWeekResponseSchema` replaces
 * `CurrentContestResponseSchema` as the payload of GET /contests/current).
 *
 * Rules (product decisions, final):
 *  Coins
 *   - 1 coin = ₹1 invested in a circle goal; only circles with ≥ CONTEST_MIN_MEMBERS
 *     ACTIVE members earn.
 *   - Every member has ONE wallet across all circles: earned − spent − on hold =
 *     available. Other members' wallets are never shown; only coins earned in a
 *     shared circle are.
 *  The weekly round (Mon 00:00 – Fri 23:59 IST)
 *   - A circle's round OPENS the moment its ACTIVE members' available coins total
 *     ≥ CONTEST_ENTRY_COST, any day Monday–Friday (the circle needs ≥ 3 active
 *     members). Every member is asked to contribute.
 *   - YES puts the member's share on hold; NO / no answer = out this week, and a
 *     no can still become a yes until Friday close. Only a positive balance can
 *     say yes.
 *   - The cost (CONTEST_ENTRY_COST per team) is split EQUALLY across all
 *     contributors, in whole coins (`contestShares`): a member below the equal
 *     share pays all they have and the others cover the rest. Shares and holds are
 *     recalculated on every change.
 *   - A contribution can be CANCELLED until `cancelCutoffAt` (Friday 00:00 IST),
 *     never on Friday. Holds for one circle reduce what is available to another.
 *  Register, teams, player vote
 *   - The creator taps Register by Friday 23:59 once the contributors' coins cover
 *     the cost (the creator need not contribute to register, but must contribute
 *     to be on a team). No tap → nothing entered, holds released.
 *   - Split options come from the CONTRIBUTORS and their coins
 *     (`contestSplitOptions`): one team of any size (even 1–2) whose coins reach
 *     CONTEST_ENTRY_COST; 2 or 3 teams only when every team has
 *     ≥ CONTEST_MIN_TEAM_MEMBERS_FOR_SPLIT contributors and there are
 *     CONTEST_ENTRY_COST coins per team. The creator may change the split until
 *     Friday 23:59. A split that RAISES shares needs every contributor's
 *     re-confirm; no answer by close = declined, and decliners drop out. A split
 *     that can no longer be covered falls back to one team automatically.
 *   - Members who say yes after Register join automatically; shares drop.
 *   - Player vote, Monday–Friday, circle-wide among contributors: one vote each,
 *     self-vote allowed, changeable until close, live COUNTS only. After the draw
 *     each team's player is its most-voted member and the backup the second
 *     (tie → whoever reached that count first; no votes → anyone may play).
 *   - Teams are previewed from the moment the creator registers: a random draw
 *     with a fixed seed per round (`previewTeams`), so it changes only when a
 *     contributor joins or leaves, and the Friday close reproduces it.
 *  Friday 23:59 close (one step)
 *   - Final shares charged (ledger debits), teams drawn among the contributors
 *     (same seeded draw as the preview), votes locked, "teams drawn" push with
 *     player and backup.
 *  Admin picks the game
 *   - The admin picks Saturday's game from the admin panel (expected Friday). If
 *     nothing is picked by close, last week's game carries over. Members see the
 *     game as soon as it is set and get a push when it is set or changed.
 *  Saturday
 *   - Only the team's active player may start its tries. Before any try starts,
 *     the player or the circle creator may pass to the backup (then the next in
 *     the ranking, then anyone). Best try counts; one winning team; tie → first
 *     to reach the score.
 *   - Fewer than CONTEST_MIN_CIRCLES circles entered → the week is cancelled and
 *     everyone refunded. The contest runs but has no winner → coins stay spent.
 *   - One coupon per winning team, sent by the admin from the admin panel and
 *     shown in the app under My coupons for CONTEST_COUPON_VALID_HOURS. Every
 *     member scratches their own foil to reveal it — the scratch is recorded per
 *     member (proof of receipt; the content is withheld until then) — and any
 *     member who has scratched may Redeem it once (an acknowledgement that the
 *     team used it, not consumption). Members who have not scratched are
 *     reminded CONTEST_COUPON_REMINDER_AFTER_HOURS after the send and
 *     CONTEST_COUPON_REMINDER_BEFORE_EXPIRY_HOURS before expiry. See
 *     MyContestCouponSchema.
 */

/** Coins one team costs for one week. Spent for good, win or lose. */
export const CONTEST_ENTRY_COST = 3000;
/** Every team of a split needs at least this many contributors. */
export const CONTEST_MIN_TEAM_MEMBERS_FOR_SPLIT = 3;
/** Contributions can be cancelled until Monday 00:00 IST + this many days (Friday 00:00 IST). */
export const CONTEST_CONTRIBUTION_CANCEL_DAYS = 4;

// --- Enums ------------------------------------------------------------------

/** A circle's weekly round. */
export enum ContestRoundStatusEnum {
  /** Contributions open; the creator has not registered yet. */
  OPEN = 'OPEN',
  /** The creator tapped Register (team count chosen). Joins and cancels still apply until close. */
  REGISTERED = 'REGISTERED',
  /** Closed Friday 23:59 with a charged entry; teams exist. Terminal. */
  ENTERED = 'ENTERED',
  /** Closed Friday 23:59 without an entry (see notEnteredReason). Terminal. */
  NOT_ENTERED = 'NOT_ENTERED',
}
export const ContestRoundStatusSchema = z.nativeEnum(ContestRoundStatusEnum);

export enum ContestRoundNotEnteredReasonEnum {
  /** The creator never tapped Register. */
  NOT_REGISTERED = 'NOT_REGISTERED',
  /** At close the contributors' coins did not cover one team. */
  SHORT_OF_COINS = 'SHORT_OF_COINS',
  /** At close the circle had fewer than CONTEST_MIN_MEMBERS active members. */
  TOO_FEW_MEMBERS = 'TOO_FEW_MEMBERS',
}
export const ContestRoundNotEnteredReasonSchema = z.nativeEnum(
  ContestRoundNotEnteredReasonEnum,
);

/** A member's answer in a round. "No answer" has no row and is rendered as null. */
export enum ContestContributionStatusEnum {
  /** Contributing; a share is on hold. */
  YES = 'YES',
  /** Said yes, then cancelled (Mon–Thu). Hold released. May say yes again. */
  CANCELLED = 'CANCELLED',
  /** Declined (or never answered) a re-confirm after a split raised the share. Out this week. */
  DECLINED = 'DECLINED',
}
export const ContestContributionStatusSchema = z.nativeEnum(ContestContributionStatusEnum);

// --- Pure helpers (server validates with these; client renders with them) -----

/**
 * Team counts the creator may choose for `contributorCount` contributors whose
 * coins total `pledgeableCoins`:
 *   coins < CONTEST_ENTRY_COST            → []        (cannot enter)
 *   otherwise                             → [1, ...k] where each k in 2..CONTEST_MAX_TEAMS
 *                                            needs contributorCount ≥ 3k AND coins ≥ 3000k
 * Examples (coins plentiful): 1 → [1]; 5 → [1]; 6 → [1, 2]; 9 → [1, 2, 3]; 11 → [1, 2, 3].
 */
export const contestSplitOptions = (
  contributorCount: number,
  pledgeableCoins: number,
): number[] => {
  if (
    !Number.isInteger(contributorCount) ||
    contributorCount < 1 ||
    pledgeableCoins < CONTEST_ENTRY_COST
  ) {
    return [];
  }
  const options = [1];
  for (let k = 2; k <= CONTEST_MAX_TEAMS; k++) {
    if (
      contributorCount >= CONTEST_MIN_TEAM_MEMBERS_FOR_SPLIT * k &&
      pledgeableCoins >= CONTEST_ENTRY_COST * k
    ) {
      options.push(k);
    }
  }
  return options;
};

export interface ContestShareInput {
  userId: string;
  /** The member's available wallet coins, NOT counting this round's own hold. */
  available: number;
}

export interface ContestShareResult {
  /** The contributors' coins cover `cost`. When false, `shares` is each member's full balance. */
  covered: boolean;
  /** Sum of `shares` (== cost when covered). */
  total: number;
  shares: Record<string, number>;
}

/**
 * Equal split of `cost` in whole coins with "water-filling": members whose
 * balance is below the equal share pay all they have, and the rest is re-split
 * equally among the others. Rounding remainders go to the earliest contributors
 * in input order (pass contributors in join order). Deterministic.
 *
 *   3,000 over 5 → 600 each;  3,000 over 7 → 429 ×4 + 428 ×3;
 *   3,000 over [a:200, b:2000, c:2000] → a 200, b 1400, c 1400.
 */
export const contestShares = (
  contributors: ContestShareInput[],
  cost: number,
): ContestShareResult => {
  const shares: Record<string, number> = {};
  const sum = contributors.reduce((acc, c) => acc + Math.max(0, c.available), 0);
  if (contributors.length === 0 || sum < cost) {
    for (const c of contributors) shares[c.userId] = Math.max(0, c.available);
    return { covered: false, total: Math.min(sum, cost), shares };
  }
  // Cap the poorest first (ascending balance; input order breaks ties). Once a
  // member can pay the equal share, so can everyone richer: they split the rest.
  const ascending = contributors
    .map((c, index) => ({ ...c, index, available: Math.max(0, c.available) }))
    .sort((a, b) => a.available - b.available || a.index - b.index);
  let remaining = cost;
  let uncapped: typeof ascending = [];
  for (let i = 0; i < ascending.length; i++) {
    const c = ascending[i];
    const equal = Math.floor(remaining / (ascending.length - i));
    if (c.available < equal) {
      shares[c.userId] = c.available;
      remaining -= c.available;
    } else {
      uncapped = ascending.slice(i);
      break;
    }
  }
  // Equal split of what is left; rounding remainders (+1 coin) go to the
  // earliest joiners who still have a coin above their share.
  const byJoin = [...uncapped].sort((a, b) => a.index - b.index);
  const base = Math.floor(remaining / byJoin.length);
  for (const c of byJoin) shares[c.userId] = base;
  let extra = remaining - base * byJoin.length;
  while (extra > 0) {
    for (const c of byJoin) {
      if (extra > 0 && c.available > shares[c.userId]) {
        shares[c.userId] += 1;
        extra -= 1;
      }
    }
  }
  return { covered: true, total: cost, shares };
};

// --- Request bodies ------------------------------------------------------------

/** POST /contests/current/contributions — say yes for this week in this circle. */
export const ContributeToContestSchema = z.object({
  groupId: z.string().min(1),
});
export type ContributeToContest = z.infer<typeof ContributeToContestSchema>;

/** DELETE /contests/current/contributions/:groupId — cancel (until cancelCutoffAt). No body. */

/** POST /contests/current/contributions/reconfirm — answer a re-confirm after a split raised the share. */
export const ReconfirmContestContributionSchema = z.object({
  groupId: z.string().min(1),
  accept: z.boolean(),
});
export type ReconfirmContestContribution = z.infer<typeof ReconfirmContestContributionSchema>;

/** POST /contests/current/registrations — creator only; teamCount ∈ contestSplitOptions(...). Same body as before. */
export const RegisterContestRoundSchema = RegisterContestSchema;
export type RegisterContestRound = z.infer<typeof RegisterContestRoundSchema>;

/** POST /contests/current/votes — vote (or change the vote) for who plays. Contributors only. */
export const ContestVoteSchema = z.object({
  groupId: z.string().min(1),
  candidateUserId: z.string().min(1),
});
export type ContestVote = z.infer<typeof ContestVoteSchema>;

/** POST /contests/teams/:teamId/handover — pass the team to the next player. Active player or circle creator; before any try. No body. */

// --- Wallet --------------------------------------------------------------------

export const CoinWalletCircleSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  /** Coins earned in this circle (lifetime). */
  earned: z.number().int(),
  /** Coins spent on contests entered from this circle (refunds already netted). */
  spent: z.number().int(),
  /** Coins currently on hold for this circle's round this week. */
  onHold: z.number().int(),
});
export type CoinWalletCircle = z.infer<typeof CoinWalletCircleSchema>;

/** GET /coins/wallet — the requesting member's wallet. */
export const CoinWalletResponseSchema = z.object({
  /** earned − spent − onHold. */
  available: z.number().int(),
  earned: z.number().int(),
  spent: z.number().int(),
  onHold: z.number().int(),
  circles: z.array(CoinWalletCircleSchema),
});
export type CoinWalletResponse = z.infer<typeof CoinWalletResponseSchema>;

// --- This week's round, per circle ------------------------------------------------

export const ContestContributorSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
  status: ContestContributionStatusSchema,
  /** Current share (0 unless YES). */
  share: z.number().int(),
  /** A split raised the share and this member has not answered yet. */
  reconfirmPending: z.boolean(),
  /** Votes received this week. */
  voteCount: z.number().int(),
});
export type ContestContributor = z.infer<typeof ContestContributorSchema>;

export const ContestMyContributionSchema = z.object({
  /** null = has not answered this week. */
  status: ContestContributionStatusSchema.nullable(),
  /** My current share; null unless YES. */
  share: z.number().int().nullable(),
  /** My available wallet coins (holds in other circles already deducted; this round's hold not). */
  walletAvailable: z.number().int(),
  /** Round OPEN/REGISTERED, phase REGISTRATION, walletAvailable > 0, not already YES. */
  canContribute: z.boolean(),
  /** YES and now < cancelCutoffAt. */
  canCancel: z.boolean(),
  reconfirmPending: z.boolean(),
  /** The share after the pending split (shown in the re-confirm prompt). */
  reconfirmShare: z.number().int().nullable(),
  myVoteUserId: z.string().nullable(),
  /** YES and the round is not closed. */
  canVote: z.boolean(),
});
export type ContestMyContribution = z.infer<typeof ContestMyContributionSchema>;

/** One member of a previewed team. */
export const ContestPreviewTeamMemberSchema = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  isMe: z.boolean(),
});
export type ContestPreviewTeamMember = z.infer<typeof ContestPreviewTeamMemberSchema>;

/**
 * A provisional team of a registered round: the draw for the chosen split
 * (`pendingTeamCount ?? teamCount`) with a fixed seed per round, so it is stable
 * across reads, changes only when a contributor joins or leaves, and the Friday
 * close reproduces it. Members are listed in draw order.
 */
export const ContestPreviewTeamSchema = z.object({
  /** 1-based, same numbering as the final `ContestRoundTeam.index`. */
  index: z.number().int(),
  /** `{circle}` for one team, `{circle} — Team {index}` for a split. */
  name: z.string(),
  members: z.array(ContestPreviewTeamMemberSchema),
});
export type ContestPreviewTeam = z.infer<typeof ContestPreviewTeamSchema>;

export const ContestRoundSchema = z.object({
  status: ContestRoundStatusSchema,
  notEnteredReason: ContestRoundNotEnteredReasonSchema.nullable(),
  /** Chosen split (1 until the creator picks). */
  teamCount: z.number().int(),
  /** A higher split awaiting re-confirms; null when none. */
  pendingTeamCount: z.number().int().nullable(),
  /** contestSplitOptions(contributors, their coins). */
  teamOptions: z.array(z.number().int()),
  /** CONTEST_ENTRY_COST × (pendingTeamCount ?? teamCount). */
  cost: z.number().int(),
  /** Sum of the YES contributors' current shares (== cost when covered). */
  pledgedCoins: z.number().int(),
  covered: z.boolean(),
  contributorCount: z.number().int(),
  registeredAt: z.coerce.date().nullable(),
  registeredByName: z.string().nullable(),
  /** Creator, phase REGISTRATION, covered, status OPEN or REGISTERED. */
  canRegister: z.boolean(),
  /** Creator, status REGISTERED, phase REGISTRATION. */
  canChangeSplit: z.boolean(),
  canCancelRegistration: z.boolean(),
  /** Friday 00:00 IST: contributions cannot be cancelled from this instant. */
  cancelCutoffAt: z.coerce.date(),
  /** The split could not be covered at close and the round fell back to one team. */
  fellBackToOneTeam: z.boolean(),
  contributors: z.array(ContestContributorSchema),
  me: ContestMyContributionSchema,
  /** Provisional teams, empty until the creator registers (see ContestPreviewTeamSchema). */
  previewTeams: z.array(ContestPreviewTeamSchema).default([]),
});
export type ContestRound = z.infer<typeof ContestRoundSchema>;

/** A team after the Friday close, with its voted player and backup. */
export const ContestRoundTeamSchema = ContestCircleTeamSchema.extend({
  playerUserId: z.string().nullable(),
  playerName: z.string().nullable(),
  backupUserId: z.string().nullable(),
  backupName: z.string().nullable(),
  /** Who may start tries right now; null = any member (no votes, or the ranking is exhausted). */
  activePlayerUserId: z.string().nullable(),
  /** The requesting user may start a try now. */
  canPlay: z.boolean(),
  /** The requesting user (active player or circle creator) may pass to the next player: no try started yet. */
  canPassToBackup: z.boolean(),
  handoverAt: z.coerce.date().nullable(),
});
export type ContestRoundTeam = z.infer<typeof ContestRoundTeamSchema>;

/** One of the requesting user's circles that has a round this week, or could (≥ 3 active members). */
export const ContestWeekCircleSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  isCreator: z.boolean(),
  creatorName: z.string().nullable(),
  activeMemberCount: z.number().int(),
  /** Sum of the ACTIVE members' available wallet coins. */
  circleAvailableCoins: z.number().int(),
  /** null until the round opens (circleAvailableCoins reaches CONTEST_ENTRY_COST). */
  round: ContestRoundSchema.nullable(),
  /** The circle's teams this week (empty until the Friday close), ordered by index. */
  teams: z.array(ContestRoundTeamSchema),
});
export type ContestWeekCircle = z.infer<typeof ContestWeekCircleSchema>;

/** The week, with the admin's game pick. */
export const ContestWeekWindowSchema = ContestWindowSchema.extend({
  /** The admin set this week's game explicitly (false → last week's game carried over). */
  gamePicked: z.boolean(),
  gamePickedAt: z.coerce.date().nullable(),
  /** Friday 00:00 IST. */
  cancelCutoffAt: z.coerce.date(),
});
export type ContestWeekWindow = z.infer<typeof ContestWeekWindowSchema>;

/**
 * GET /contests/current (v3) — this week for the requesting user. `circles` holds
 * every circle of the user with ≥ CONTEST_MIN_MEMBERS active members (the card
 * shows how far the circle is from opening a round). `leaderboard` is empty
 * before Saturday. `result` is null until finalized or cancelled.
 */
export const ContestWeekResponseSchema = z.object({
  contest: ContestWeekWindowSchema,
  wallet: CoinWalletResponseSchema,
  circles: z.array(ContestWeekCircleSchema),
  leaderboard: z.array(ContestLeaderboardRowSchema),
  result: ContestResultSchema.nullable(),
});
export type ContestWeekResponse = z.infer<typeof ContestWeekResponseSchema>;

// ---------------------------------------------------------------------------
// Coupons — sent by the admin, delivered in the app to the winning team
// ---------------------------------------------------------------------------

export enum ContestCouponStatusEnum {
  /** Sent, not redeemed, not expired. */
  LIVE = 'LIVE',
  /** Redeemed and not yet expired — content still visible. */
  REDEEMED = 'REDEEMED',
  /** CONTEST_COUPON_VALID_HOURS passed — content withheld, entry greyed. */
  EXPIRED = 'EXPIRED',
}
export const ContestCouponStatusSchema = z.nativeEnum(ContestCouponStatusEnum);

/** Fixed validity of a sent coupon, in hours from `sentAt`. */
export const CONTEST_COUPON_VALID_HOURS = 48;
/** Max length of the coupon text the admin types. */
export const CONTEST_COUPON_TEXT_MAX = 2000;
/** Lifetime of the presigned image / PDF links in a response. */
export const CONTEST_COUPON_LINK_TTL_SECONDS = 60 * 60;
/** Hours after `sentAt` at which recipients who have not scratched are reminded once (CONTEST_COUPON_REMINDER). */
export const CONTEST_COUPON_REMINDER_AFTER_HOURS = 24;
/** Hours before `expiresAt` at which recipients who have not scratched are reminded once more. */
export const CONTEST_COUPON_REMINDER_BEFORE_EXPIRY_HOURS = 2;

/** One teammate's scratch (reveal) of the coupon. */
export const ContestCouponRevealSchema = z.object({
  userId: z.string(),
  /** Short display name, e.g. "Ram" (same rule as `redeemedByName`). */
  name: z.string(),
  /** The requesting member (the contest week API marks team members the same way). */
  isMe: z.boolean(),
  revealedAt: z.coerce.date(),
});
export type ContestCouponReveal = z.infer<typeof ContestCouponRevealSchema>;

/**
 * One coupon as the requesting member sees it. `status` is computed by the
 * server (the only truth about expiry); `imageUrl` / `pdfUrl` are presigned for
 * CONTEST_COUPON_LINK_TTL_SECONDS and null once EXPIRED, as is `text`. All three
 * are also null until the requesting member has scratched (`revealedByMe`).
 */
export const MyContestCouponSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  weekKey: z.string(),
  /** "19 – 25 Oct 2026" — the same label the admin sees. */
  weekLabel: z.string(),
  teamName: z.string(),
  groupName: z.string(),
  /** Admin's text; null when the coupon is image-only, EXPIRED, or not yet revealed by the requesting member. */
  text: z.string().nullable(),
  /** An image was attached (true even when the URL is withheld: EXPIRED or not yet revealed). */
  hasImage: z.boolean(),
  /** Presigned, CONTEST_COUPON_LINK_TTL_SECONDS; null when no image, EXPIRED, or not yet revealed by the requesting member. */
  imageUrl: z.string().nullable(),
  /** Presigned PDF (image + text + week + team); null when EXPIRED or not yet revealed by the requesting member. */
  pdfUrl: z.string().nullable(),
  sentAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  status: ContestCouponStatusSchema,
  redeemedAt: z.coerce.date().nullable(),
  redeemedByUserId: z.string().nullable(),
  /** Short display name of the redeemer, e.g. "Ram". */
  redeemedByName: z.string().nullable(),
  /** The requesting member is the one who redeemed. */
  redeemedByMe: z.boolean(),
  /**
   * The requesting member has scratched (revealed) the coupon. Until then
   * `text`, `imageUrl` and `pdfUrl` are null and Redeem is refused
   * (COUPON_NOT_REVEALED). Recorded once per member, on every device.
   */
  revealedByMe: z.boolean(),
  /** When the requesting member scratched it; null until then. */
  revealedAt: z.coerce.date().nullable(),
  /** Members of the winning team the coupon was sent to. */
  recipientCount: z.number().int().nonnegative(),
  /** Every teammate who has scratched, the requesting member included, earliest first. */
  reveals: z.array(ContestCouponRevealSchema),
});
export type MyContestCoupon = z.infer<typeof MyContestCouponSchema>;

/** GET /contests/coupons — LIVE/REDEEMED first (newest sentAt), then EXPIRED. */
export const MyContestCouponsResponseSchema = z.object({
  coupons: z.array(MyContestCouponSchema),
});
export type MyContestCouponsResponse = z.infer<typeof MyContestCouponsResponseSchema>;

/** POST /contests/coupons/:couponId/redeem — returns the fresh coupon. */
export const RedeemContestCouponResponseSchema = MyContestCouponSchema;
export type RedeemContestCouponResponse = z.infer<typeof RedeemContestCouponResponseSchema>;

/**
 * POST /contests/coupons/:couponId/reveal — records the requesting member's
 * scratch (idempotent) and returns the fresh coupon with its content.
 * COUPON_EXPIRED after CONTEST_COUPON_VALID_HOURS.
 */
export const RevealContestCouponResponseSchema = MyContestCouponSchema;
export type RevealContestCouponResponse = z.infer<typeof RevealContestCouponResponseSchema>;
