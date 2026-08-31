/**
 * Fund investment restrictions derived from BSE's fund event log.
 *
 * BSE publishes events against funds (`fund_events` joined to `event_list`),
 * refreshed nightly by the `etao-scheduler-fund-events` job. Among them are
 * suspensions and resumptions of investing — an AMC closing a scheme to new
 * money for a while, then reopening it.
 *
 * THREE THINGS MAKE THIS EASY TO GET WRONG:
 *
 * 1. It is an append-only HISTORY, not a status column. A fund suspended in
 *    January and resumed in March has both rows. Deciding "is it suspended"
 *    means taking the LATEST event, never merely checking one exists. As of
 *    2026-08-28 production held 115 funds whose latest event was a suspension
 *    and 32 whose latest was a resumption — treating the resumed ones as
 *    suspended would wrongly block perfectly investable funds.
 *
 * 2. Suspensions are per investment mode, and each has its own resumption.
 *    "Suspension of lumpsum" (25) leaves SIP available; "Suspension of fresh
 *    SIP" (36) is undone by 37, not by 28. Pairing them wrongly means a fund
 *    BSE reopened stays blocked in our app indefinitely.
 *
 * 3. Some suspensions have no resumption at all — 9 (permanent suspension of
 *    sales) and 22 (scheme withdrawn) are terminal by nature.
 *
 * SAFE BY DEFAULT: only event ids listed here as suspensions ever block. An
 * event we have not classified — including any BSE adds later — is treated as
 * non-blocking. The cost of that choice is a request BSE rejects (which the
 * caller surfaces); the cost of the opposite would be silently locking users
 * out of funds they can legitimately invest in.
 *
 * Ids below are BSE's own, verified against the full `event_list` (39 rows).
 */

/** Event ids as published in BSE's `event_list`. */
export enum FundEventId {
  REDEMPTION = 1,
  SCHEME_NAME_CHANGE = 4,
  SCHEME_MERGER = 6,
  SCHEME_TERMINATION = 7,
  /** Sales suspended permanently. No resumption counterpart exists. */
  SALES_PERMANENTLY_SUSPENDED = 9,
  NAV_RESUMED = 13,
  NAV_DISCONTINUED = 20,
  /** Scheme launched then withdrawn by the AMC. Terminal. */
  SCHEME_WITHDRAWN = 22,
  ALL_FRESH_RESUMED = 23,
  ALL_FRESH_SUSPENDED = 24,
  LUMPSUM_SUSPENDED = 25,
  LUMPSUM_RESUMED = 26,
  SIP_STP_SUSPENDED = 27,
  SIP_STP_RESUMED = 28,
  EXISTING_SIP_SUSPENDED = 32,
  EXISTING_SIP_RESUMED = 33,
  FRESH_SIP_SUSPENDED = 36,
  FRESH_SIP_RESUMED = 37,
}

/**
 * A suspend/resume pair, resolved by whichever event is newest.
 *
 * `resume` is empty for terminal suspensions (9, 22) — nothing lifts those, so
 * once they are the newest event in their group they stay in force.
 */
export interface FundEventPair {
  readonly suspend: readonly FundEventId[];
  readonly resume: readonly FundEventId[];
}

/**
 * Groups deciding whether a NEW SIP may be started.
 *
 * `EXISTING_SIP_SUSPENDED` is deliberately absent: it stops installments on
 * SIPs already running and says nothing about registering a new one. It is
 * surfaced as an advisory instead.
 */
export const SIP_RESTRICTION_GROUPS: readonly FundEventPair[] = [
  {
    suspend: [FundEventId.ALL_FRESH_SUSPENDED],
    resume: [FundEventId.ALL_FRESH_RESUMED],
  },
  {
    suspend: [FundEventId.SIP_STP_SUSPENDED],
    resume: [FundEventId.SIP_STP_RESUMED],
  },
  {
    suspend: [FundEventId.FRESH_SIP_SUSPENDED],
    resume: [FundEventId.FRESH_SIP_RESUMED],
  },
  {
    suspend: [
      FundEventId.SALES_PERMANENTLY_SUSPENDED,
      FundEventId.SCHEME_WITHDRAWN,
    ],
    resume: [],
  },
];

/** Groups deciding whether a lumpsum purchase may be placed. */
export const LUMPSUM_RESTRICTION_GROUPS: readonly FundEventPair[] = [
  {
    suspend: [FundEventId.ALL_FRESH_SUSPENDED],
    resume: [FundEventId.ALL_FRESH_RESUMED],
  },
  {
    suspend: [FundEventId.LUMPSUM_SUSPENDED],
    resume: [FundEventId.LUMPSUM_RESUMED],
  },
  {
    suspend: [
      FundEventId.SALES_PERMANENTLY_SUSPENDED,
      FundEventId.SCHEME_WITHDRAWN,
    ],
    resume: [],
  },
];

/**
 * Non-blocking conditions worth telling the investor about. Paired ones are
 * resolved the same way — an existing-SIP suspension that has since resumed
 * must not still be shown.
 */
export const ADVISORY_GROUPS: readonly FundEventPair[] = [
  {
    suspend: [FundEventId.EXISTING_SIP_SUSPENDED],
    resume: [FundEventId.EXISTING_SIP_RESUMED],
  },
  {
    suspend: [FundEventId.NAV_DISCONTINUED],
    resume: [FundEventId.NAV_RESUMED],
  },
  {
    suspend: [FundEventId.SCHEME_MERGER, FundEventId.SCHEME_TERMINATION],
    resume: [],
  },
];

/** Every event id this module reasons about, for query filtering. */
export const RESTRICTION_RELEVANT_EVENT_IDS: readonly number[] = Array.from(
  new Set<number>(
    [
      ...SIP_RESTRICTION_GROUPS,
      ...LUMPSUM_RESTRICTION_GROUPS,
      ...ADVISORY_GROUPS,
    ].flatMap(group => [...group.suspend, ...group.resume]),
  ),
);

/** Investor-facing copy. BSE's own descriptions are written for members. */
export const FUND_EVENT_MESSAGES: Readonly<Record<number, string>> = {
  [FundEventId.ALL_FRESH_SUSPENDED]:
    'This fund has temporarily stopped accepting new investments.',
  [FundEventId.LUMPSUM_SUSPENDED]:
    'This fund has temporarily stopped accepting lumpsum investments.',
  [FundEventId.SIP_STP_SUSPENDED]:
    'This fund has temporarily stopped accepting new SIPs.',
  [FundEventId.FRESH_SIP_SUSPENDED]:
    'This fund has temporarily stopped accepting new SIPs.',
  [FundEventId.SALES_PERMANENTLY_SUSPENDED]:
    'This fund is no longer accepting investments.',
  [FundEventId.SCHEME_WITHDRAWN]: 'This scheme has been withdrawn by the AMC.',
  [FundEventId.EXISTING_SIP_SUSPENDED]:
    'Installments on existing SIPs in this fund are temporarily paused.',
  [FundEventId.SCHEME_MERGER]:
    'This scheme is being merged into another scheme.',
  [FundEventId.SCHEME_TERMINATION]: 'This scheme is being closed.',
  [FundEventId.NAV_DISCONTINUED]:
    'This fund has temporarily stopped declaring NAV.',
};

/** One restriction or advisory on a fund, as returned to clients. */
export interface FundEventNotice {
  eventId: number;
  /** BSE's own event_type, for support and debugging. */
  eventType: string | null;
  /** Investor-facing copy where we have it, else BSE's description. */
  message: string;
  /** The date BSE recorded the event, ISO-8601. */
  asOnDate: string;
}

/**
 * Whether a fund currently accepts each kind of investment, plus anything the
 * investor should know. A fund with no events yields
 * `sipAllowed: true, lumpsumAllowed: true, advisories: []`.
 */
export interface FundInvestmentRestrictions {
  sipAllowed: boolean;
  lumpsumAllowed: boolean;
  /** Present only when the corresponding mode is blocked. */
  sipBlockedReason?: FundEventNotice;
  lumpsumBlockedReason?: FundEventNotice;
  /** Non-blocking things worth surfacing (merger, closure, paused installments). */
  advisories: FundEventNotice[];
}
