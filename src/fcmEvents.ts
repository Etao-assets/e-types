/**
 * FCM Event Types and Data Structures
 *
 * This module defines the event types and data structures for Firebase Cloud Messaging (FCM)
 * notifications used throughout the application.
 *
 * @module fcmEvents
 */

export enum FCMEventType {
  UPI_MANDATE_SUCCESS = 'upi_mandate_success',
  ENACH_MANDATE_SUCCESS = 'enach_mandate_success',
  LUMPSUM_TWO_FA_SUCCESS = 'lumpsum_2fa_success',
  LUMPSUM_PAYMENT_SUCCESS = 'payment_success', // When a lumpsum order is successful (after 2FA)
  LUMPSUM_PAYMENT_FAILED = 'payment_failed',
  UCC_ACTIVE = 'ucc_active',
  UCC_AUTH_UCC = 'ucc_auth_ucc',
  LUMPSUM_ORDER_CANCELLED = 'cancelled', // When a lumpsum order is cancelled (after 2FA)
  SXP_ACTIVE = 'sxp_active', // When client completes 2FA authentication for SIP registration
  SXP_ORDER_TRIGGERED = 'sxp_order_triggered', // When a SIP installment order is triggered
  PAYMENT_PENDING = 'payment_pending', // When payment is pending after placing lumpsum order
  ENACH_MANDATE_ACTIVE = 'enach_mandate_active', // When eNACH mandate becomes active
  NOTIFICATION_COUNT_REFRESH = 'notif_refresh', // Silent push to trigger unread count refresh
  UPI_MANDATE_CANCELLED = 'upi_mandate_cancelled', // When a UPI mandate is cancelled
  ENACH_MANDATE_CANCELLED = 'enach_mandate_cancelled', // When an eNACH mandate is cancelled
  INVITE_CONSENT_REQUEST = 'invite_consent_request', // When an active group member receives a request to consent for inviting new members
  INVITE_CONSENT_DECLINED = 'invite_consent_declined', // When a user declines an invite consent request
  SIP_ORDER_DEPOSIT_SUCCESS = 'sip_order_deposit_success', // When SIP order deposit is successful
  LUMPSUM_ORDER_DEPOSIT_SUCCESS = 'lumpsum_order_deposit_success', // When lumpsum order deposit is successful
  RD_ORDER_DEPOSIT_SUCCESS = 'rd_order_deposit_success', // When RD order deposit is successful
  FD_ORDER_DEPOSIT_SUCCESS = 'fd_order_deposit_success', // When FD order deposit is successful
  GROUP_COINS_GATE_UNLOCKED = 'GROUP_COINS_GATE_UNLOCKED',
  GROUP_GAME_STARTED = 'GROUP_GAME_STARTED', // Creator selected mode + game, or a rematch round opened; data carries roundNo
  GROUP_GAME_ENDED = 'GROUP_GAME_ENDED', // Tournament closed, winner decided

  // Mutual fund redemption — BSE `order_new` type "r". Sent ONLY for an order
  // whose orderType is REDEMPTION; purchase and SIP pushes are unchanged. Every
  // one carries RedemptionFcmData: { type, orderId (BSE order id), event }.
  // See etao-nextjs docs/mutual-fund-sip-redemption-implementation.md §11.9.
  REDEMPTION_STATUS_UPDATED = 'redemption_status_updated', // SILENT. A lifecycle stage not listed below — received, order_2fa_pending, sent_to_rta (the FIRST event after 2FA; the 2FA webview advances on it), queued_for_rta, rta_resp_rcvd, amc_mis_payout_updated (payout details refreshed), redempt_payout_attempted. `event` says which.
  REDEMPTION_FUNDS_RELEASED = 'redemption_funds_released', // redempt_rta_settled — the RTA has released the redemption proceeds
  REDEMPTION_COMPLETED = 'redemption_completed', // done on a redemption order
  REDEMPTION_REJECTED = 'redemption_rejected', // rta_rejected / platform_rejected / ops_rejected on a redemption; body carries BSE's reason verbatim; no units were sold
  REDEMPTION_PAYOUT_FAILED = 'redemption_payout_failed', // redempt_payout_failed / redempt_fund_returned_amc — the bank transfer did not land
}

/**
 * UPI Mandate FCM Data
 */

export interface FcmDataBase {
  type: FCMEventType;
}

export interface UpiMandateFcmData extends FcmDataBase {
  mandateId: string;
}

/**
 * eNACH Mandate FCM Data
 */
export interface EnachMandateFcmData extends FcmDataBase {
  mandateId: string;
}

/**
 * Lumpsum FCM Data
 */
export interface LumpsumFcmData extends FcmDataBase {
  orderId: string;
}

/**
 * Redemption FCM Data — payload of every `REDEMPTION_*` event
 */
export interface RedemptionFcmData extends FcmDataBase {
  /** BSE order id of the redemption order, as a string — the same id `LumpsumFcmData.orderId` carries. */
  orderId: string;
  /** The BSE webhook event that produced this push, e.g. `sent_to_rta`, `done`, `rta_rejected`. */
  event: string;
}

/**
 * FCM Event Data payload interface
 * Represents the data structure received from FCM notifications
 */
export interface FCMEventData {
  /**
   * The type of FCM event
   */
  type: FCMEventType | string;

  /**
   * Additional data fields (optional)
   * Can include mandate details, payment info, etc.
   */
  [key: string]: any;
}

/**
 * Group game FCM Data — GROUP_GAME_STARTED / GROUP_GAME_ENDED
 */
export interface GroupGameFcmData extends FcmDataBase {
  groupId: string;
  /** Round that opened (STARTED) or the final round (ENDED). */
  roundNo: number;
}

/**
 * Type guard to check if a string is a valid FCM event type
 */
export const isFCMEventType = (value: string): value is FCMEventType => {
  return Object.values(FCMEventType).includes(value as FCMEventType);
};
