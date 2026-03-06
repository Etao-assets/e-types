export enum WebhookEventType {
  UCC = 'UCC',
  ORDER = 'ORDER',
  SXP = 'SXP',
  MANDATES = 'MANDATES',
  PAYMENT_GATEWAY = 'PAYMENT GATEWAY',
}

//2FA Included Members
export enum UccWebhookEvent {
  // flowCode: 0
  // desc: This will be the initial event triggered (Client authentication pending)
  PENDING_AUTHENTICATION = 'PENDING_AUTHENTICATION',
  
  // flowCode: 1
  // desc: This event will be triggered when client authentication is accepted by the Client.
  UCC_AUTH_UCC = 'ucc_auth_ucc',
  
  // flowCode: 2
  // desc: This event indicates that the client's details are undergoing third party verifications (PAN/KYC/Bank etc.).
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  
  // flowCode: 2
  // desc: This event will be triggered (Client Elog authentication is pending).
  UCC_ELOG_VERIFICATION = 'ucc_elog_verification',
  
  // flowCode: 3
  // desc: This event indicates UCC KYC Verification is Completed.
  UCC_KYC_VERIFICATION = 'ucc_kyc_verification',
  
  // flowCode: 3
  // desc: This event indicates UCC Pan Verification is Completed.
  UCC_PAN_VERIFICATION = 'ucc_pan_verification',
  
  // flowCode: 3,5
  // desc: This event indicates UCC Bank Verification is Completed.
  UCC_BANK_ACC = 'ucc_bank_acc',
  
  // flowCode: 3
  // desc: Its status is contingent upon user acceptance and can be triggered at any stage of the workflow cycle after (ucc_elog_verification).
  UCC_AUTH_ELOG = 'ucc_auth_elog',
  
  // flowCode: 3
  // desc: Its status is contingent upon user acceptance and can be triggered at any stage of the workflow cycle after (PENDING_VERIFICATION).
  UCC_AUTH_NOMINEE = 'ucc_auth_nominee',
  
  // flowCode: 4
  // desc: The event indicates the UCC is active and available for Transaction.
  ACTIVE = 'ACTIVE',
  
  // flowCode: 5
  // desc: This event will only trigger if the UCC has been suspended by Exchange.
  SUSPENDED = 'suspended',
}

//lumpsum
export enum OrderWebhookEvent {
  // State 0: Order Received
  RECEIVED = 'received',
  
  // State 1: Order 2FA Pending - In case of 2FA included member
  ORDER_2FA_PENDING = 'order_2fa_pending',
  
  // State 2: Bank TPV Pending
  BANK_TPV_PENDING = 'bank_tpv_pending',
  
  // State 2: Payment Pending
  PAYMENT_PENDING = 'payment_pending',
  
  // State 3: OMB Pending - ICCL
  MATCH_PENDING = 'match_pending',
  
  // State 4: OMB Completed - ICCL
  MATCHED = 'matched',
  
  // State 5: Final CFF File reported to RTA
  SENT_TO_RTA = 'sent_to_rta',
  
  // State 6: CFF in RTA Processing
  QUEUED_FOR_RTA = 'queued_for_rta',
  
  // State 7: In case of CFF Upload level failure - If Order need to be reprocessed
  RTA_REPROCESS = 'rta_reprocess',
  
  // State 7: RFF Received from RTA
  RTA_RESP_RCVD = 'rta_resp_rcvd',
  
  // State 7: Order Rejected by RTA
  RTA_REJECTED = 'rta_rejected',
  
  // State 8: Units Settled by RTA
  UNITS_RTA_SETTLED = 'units_rta_settled',
  
  // State 9: Order Cycle Complete
  DONE = 'done',
  
  // State S: Order rejected - Order placed exceeds threshold limit
  PLATFORM_REJECTED = 'platform_rejected',
  
  // State S: Threshold approval pending - Threshold is in approval stage
  THRESHOLD_APPROVAL_PENDING = 'threshold_approval_pending',
  
  // State S1: Ops rejected - Threshold is not approved by Ops team
  OPS_REJECTED = 'ops_rejected',
}

export enum SxpWebhookEvent {
  // State 0: SIP registration initiated
  // This will be initial event indicating SXP has been successfully registered at BSE
  REG = 'reg',
  
  // State 1: Two-factor authentication pending (for 2FA included members)
  SXP_2FA_PENDING = 'sxp_2fa_pending',
  // State 1,2: SIP active, installments will execute
  // For 2FA Included Member: Triggered after client completes 2FA authentication
  // For 2FA Excluded Members: The SXP order will be default in active state
  ACTIVE = 'active',

  // State 3: Installment order created (contains order_id for child order)
  // This event will be triggered when child orders are initiated for the registered SXPs
  SXP_ORDER_TRIGGERED = 'sxp_order_triggered',
  
  // State S: SIP paused by client
  // This event will be triggered depending upon client initiation
  PAUSED = 'paused',
  
  // State S: SIP cancelled by investor
  // This event will be triggered depending upon client initiation
  SXP_INVESTOR_CANC = 'sxp_investor_canc',
  
  // State S: SIP cancelled by the exchange
  // This event will be triggered if the SXP order is cancelled by the exchange
  CANCELLED = 'cancelled',
  
  // State S: Mandate unlinked from SIP
  // This event will be triggered depending upon client initiation
  MANDATE_UNLINK = 'mandate_unlink',
  
  // State S: Auto-cancelled after 3 consecutive failures
  // This event will only trigger if three consecutive SIPs fail
  AUTOCANCELLED = 'autocancelled',
  
  // State S: SIP matured
  // This event will only trigger if SXP order has matured
  MATURED = 'matured',
}

/**
 * Mapping between SxpWebhookEvent and SxPStatus from v2Enums
 * Maps webhook events to their corresponding SIP status values
 */
export const SxpWebhookEventToStatusMap: Record<SxpWebhookEvent, string> = {
  [SxpWebhookEvent.REG]: 'pending',
  [SxpWebhookEvent.SXP_2FA_PENDING]: 'pending',
  [SxpWebhookEvent.ACTIVE]: 'active',
  [SxpWebhookEvent.SXP_ORDER_TRIGGERED]: 'active', // Remains active during installment execution
  [SxpWebhookEvent.PAUSED]: 'paused',
  [SxpWebhookEvent.SXP_INVESTOR_CANC]: 'cancelled',
  [SxpWebhookEvent.CANCELLED]: 'cancelled',
  [SxpWebhookEvent.MANDATE_UNLINK]: 'cancelled',
  [SxpWebhookEvent.AUTOCANCELLED]: 'cancelled',
  [SxpWebhookEvent.MATURED]: 'completed',
};

export enum MandateWebhookEnachEvent {
  // State 0: Mandate registration initiated
  INITIATED = 'initiated',
  
  // State 1: Awaiting investor authentication via bank
  INVESTOR_AUTH_AWAITED = 'investor_auth_awaited',
  
  // State 2: Mandate authenticated and active (required for SIP registration)
  ACTIVE = 'active',
  
  // State 2: Mandate authentication failed/rejected
  REJECTED = 'rejected',
  
  // State S: Mandate cancelled by the investor
  CANCELLED = 'cancelled',
  
  // State S: Mandate completed (end date reached)
  COMPLETED = 'completed',
}

export enum MandateWebhookUpiEvent {
  // State 0: Mandate registration process initiated
  INITIATED = 'initiated',
  
  // State 1: Investor authentication pending
  IN_PROCESS_AGENCY = 'in_process_agency',
  
  // State 2: Mandate successfully active at agency
  ACTIVE = 'active',
  
  // State 2: Mandate registration process not completed at agency
  REJECTED = 'rejected',
  
  // State S: Mandate cancelled by the investor
  CANCELLED = 'cancelled',
  
  // State S: Mandate completed (end date reached)
  COMPLETED = 'completed',
  
  // State S: Mandate rejected by agency
  AUTO_REJECTED = 'auto_rejected',
  
  // State S: Amount successfully pre-debited from the account
  PRE_DEBIT_NOTIFICATION_SENT_SUCCESSFULLY = 'pre_debit_notification_sent_successfully',
  
  // State S: Investor wants to cancel the mandate (2FA enabled members)
  INVESTOR_AUTH_AWAITED = 'investor_auth_awaited',
}

export enum PaymentGatewayWebhookEvent {
  // State 3: Payment captured successfully (resumes order processing)
  AGENCY_APPROVED = 'agency_approved',
  
  // State 3: Payment failed/declined
  AGENCY_REJECTED = 'agency_rejected',
}

export type WebhookEvent = 
  | UccWebhookEvent 
  | OrderWebhookEvent 
  | SxpWebhookEvent 
  | MandateWebhookEnachEvent
  | MandateWebhookUpiEvent
  | PaymentGatewayWebhookEvent;

