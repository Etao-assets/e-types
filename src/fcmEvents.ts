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
  MANDATE_CANCELLED = 'mandate_cancelled', // When a mandate (UPI or eNACH) is cancelled
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
 * Type guard to check if a string is a valid FCM event type
 */
export const isFCMEventType = (value: string): value is FCMEventType => {
  return Object.values(FCMEventType).includes(value as FCMEventType);
};
