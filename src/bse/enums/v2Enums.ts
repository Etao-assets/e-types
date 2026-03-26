/**
 * BSE StARMF v2 API - All Enums
 * Aggregated from bse_starmf_enums.ts and doc constants
 * Do not edit existing files, only add new enums here
 */

// ===============================
// API Response Status
// ===============================
//bse api status enum
export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

// ===============================
// UCC (Unique Client Code) Module
// ===============================
export enum HoldingNature {
  SINGLE = 'SI',
  JOINT = 'JO',
  ANYONE_OR_SURVIVOR = 'AS',
  MINOR = 'MI',
  INSTITUTION = 'IN',
  CUSTODY = 'CU',
}

export enum TaxCode {
  INDIVIDUAL = '01',
  ON_BEHALF_OF_MINOR = '02',
  HUF = '03',
  COMPANY = '04',
  AOP = '05',
  PARTNERSHIP_FIRM = '06',
  BODY_CORPORATE = '07',
  TRUST = '08',
  SOCIETY = '09',
  OTHERS = '10',
  NRI_OTHERS = '11',
  DFI = '12',
  SOLE_PROPRIETORSHIP = '13',
  NRE = '21',
  OCB = '22',
  FII = '23',
  NRO = '24',
  OVERSEAS_CORP_BODY_OTHERS = '25',
  NRI_CHILD = '26',
  NRI_HUF_NRO = '27',
  NRI_MINOR_NRO = '28',
  NRI_HUF_NRE = '29',
  PROVIDENT_FUND = '31',
  SUPER_ANNUATION_FUND = '32',
  GRATUITY_FUND = '33',
  PENSION_FUND = '34',
  MUTUAL_FUNDS_FOF_SCHEMES = '36',
  NPS_TRUST = '37',
  GLOBAL_DEVELOPMENT_NETWORK = '38',
  FCRA = '39',
  QFI_INDIVIDUAL = '41',
  QFI_MINORS = '42',
  QFI_CORPORATE = '43',
  QFI_PENSION_FUNDS = '44',
  QFI_HEDGE_FUNDS = '45',
  QFI_MUTUAL_FUNDS = '46',
  LLP = '47',
  NON_PROFIT_ORGANIZATION_NPO = '48',
  PUBLIC_LIMITED_COMPANY = '51',
  PRIVATE_LIMITED_COMPANY = '52',
  UNLISTED_COMPANY = '53',
  MUTUAL_FUNDS = '54',
  FPI_CATEGORY_I = '55',
  FPI_CATEGORY_II = '56',
  FPI_CATEGORY_III = '57',
  FINANCIAL_INSTITUTIONS = '58',
  BODY_OF_INDIVIDUALS = '59',
  INSURANCE_COMPANY = '60',
  OCI_REPATRIATION = '61',
  OCI_NON_REPATRIATION = '62',
  PERSON_OF_INDIAN_ORIGIN = '70',
  GOVERNMENT_BODY = '72',
  DEFENSE_ESTABLISHMENT = '73',
  NON_GOVERNMENT_ORGANISATION = '74',
  BANK_CO_OPERATIVE_BANK = '75',
  ARTIFICIAL_JURIDICAL_PERSON = '76',
  SEAFARER_NRE = '77',
  SEAFARER_NRO = '78',
}

export enum TaxStatus {
  INDIVIDUAL = 'Individual',
  ON_BEHALF_OF_MINOR = 'On behalf of minor',
  HUF = 'HUF',
  COMPANY = 'Company',
  AOP = 'AOP',
  PARTNERSHIP_FIRM = 'Partnership Firm',
  BODY_CORPORATE = 'Body Corporate',
  TRUST = 'Trust',
  SOCIETY = 'Society',
  OTHERS = 'Others',
  NRI_OTHERS = 'NRI-Others',
  DFI = 'DFI',
  SOLE_PROPRIETORSHIP = 'Sole Proprietorship',
  NRE = 'NRE',
  OCB = 'OCB',
  FII = 'FII',
  NRO = 'NRO',
  OVERSEAS_CORP_BODY_OTHERS = 'Overseas Corp. Body - Others',
  NRI_CHILD = 'NRI Child',
  NRI_HUF_NRO = 'NRI - HUF NRO',
  NRI_MINOR_NRO = 'NRI - Minor NRO',
  NRI_HUF_NRE = 'NRI - HUF NRE',
  PROVIDENT_FUND = 'Provident Fund',
  SUPER_ANNUATION_FUND = 'Super Annuation Fund',
  GRATUITY_FUND = 'Gratuity Fund',
  PENSION_FUND = 'Pension Fund',
  MUTUAL_FUNDS_FOF_SCHEMES = 'Mutual Funds FOF Schemes',
  NPS_TRUST = 'NPS Trust',
  GLOBAL_DEVELOPMENT_NETWORK = 'Global Development Network',
  FCRA = 'FCRA',
  QFI_INDIVIDUAL = 'QFI - Individual',
  QFI_MINORS = 'QFI - Minors',
  QFI_CORPORATE = 'QFI - Corporate',
  QFI_PENSION_FUNDS = 'QFI - Pension Funds',
  QFI_HEDGE_FUNDS = 'QFI - Hedge Funds',
  QFI_MUTUAL_FUNDS = 'QFI - Mutual Funds',
  LLP = 'LLP',
  NON_PROFIT_ORGANIZATION_NPO = 'Non-Profit organization (NPO)',
  PUBLIC_LIMITED_COMPANY = 'Public Limited Company',
  PRIVATE_LIMITED_COMPANY = 'Private Limited Company',
  UNLISTED_COMPANY = 'Unlisted Company',
  MUTUAL_FUNDS = 'Mutual Funds',
  FPI_CATEGORY_I = 'FPI - Category I',
  FPI_CATEGORY_II = 'FPI - Category II',
  FPI_CATEGORY_III = 'FPI - Category III',
  FINANCIAL_INSTITUTIONS = 'Financial Institutions',
  BODY_OF_INDIVIDUALS = 'Body of Individuals',
  INSURANCE_COMPANY = 'Insurance Company',
  OCI_REPATRIATION = 'OCI - Repatriation',
  OCI_NON_REPATRIATION = 'OCI - Non Repatriation',
  PERSON_OF_INDIAN_ORIGIN = 'Person of Indian Origin',
  GOVERNMENT_BODY = 'Government Body',
  DEFENSE_ESTABLISHMENT = 'Defense Establishment',
  NON_GOVERNMENT_ORGANISATION = 'Non - Government Organisation',
  BANK_CO_OPERATIVE_BANK = 'Bank/Co-Operative Bank',
  ARTIFICIAL_JURIDICAL_PERSON = 'Artificial Juridical person',
  SEAFARER_NRE = 'Seafarer NRE',
  SEAFARER_NRO = 'Seafarer NRO',
}

export enum RdmpIdcwPayModeLabel {
  CHEQUE = 'Cheque',
  DIRECT_CREDIT = 'Direct Credit',
  ELECTRONIC_CLEARING_SERVICE = 'Electronic Clearing Service',
  NATIONAL_ELECTRONIC_FUND_TRANSFER = 'National Electronic Fund Transfer',
  REAL_TIME_GROSS_SETTLEMENT = 'Real-Time Gross Settlement',
}

export enum RdmpIdcwPayModeValue {
  CHEQUE = '01',
  DIRECT_CREDIT = '02',
  ELECTRONIC_CLEARING_SERVICE = '03',
  NATIONAL_ELECTRONIC_FUND_TRANSFER = '04',
  REAL_TIME_GROSS_SETTLEMENT = '05',
}

export enum UCCStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_AUTH = 'PENDING_AUTH',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

export enum CommunicationModeLabel {
  PHYSICAL = 'Physical',
  MOBILE = 'Mobile',
  EMAIL = 'Email',
}

export enum CommunicationModeValue {
  PHYSICAL = 'P',
  MOBILE = 'M',
  EMAIL = 'E',
}

export enum OnboardingType {
  PAPER = 'P',
  PAPERLESS = 'Z',
}

export enum HolderRankType {
  PRIMARY = 'Primary Holder',
  SECOND = 'Second Holder',
  THIRD = 'Third Holder',
  GUARDIAN = 'Guardian',
}

export enum HolderRank {
  PRIMARY = '1',
  SECOND = '2',
  THIRD = '3',
  GUARDIAN = '-1',
}

export enum OccupationCode {
  Business = '01',
  Service = '02',
  Professional = '03',
  Agriculturist = '04',
  Retired = '05',
  Housewife = '06',
  Student = '07',
  Others = '08',
  Doctor = '09',
  PrivateSectorService = '41',
  PublicSectorService = '42',
  ForexDealer = '43',
  GovernmentService = '44',
  UnknownOrNotApplicable = '99',
}

export const OccupationCodeLabel: Record<OccupationCode, string> = {
  [OccupationCode.Business]: 'Business',
  [OccupationCode.Service]: 'Service',
  [OccupationCode.Professional]: 'Professional',
  [OccupationCode.Agriculturist]: 'Agriculturist',
  [OccupationCode.Retired]: 'Retired',
  [OccupationCode.Housewife]: 'Housewife',
  [OccupationCode.Student]: 'Student',
  [OccupationCode.Others]: 'Others',
  [OccupationCode.Doctor]: 'Doctor',
  [OccupationCode.PrivateSectorService]: 'Private Sector Service',
  [OccupationCode.PublicSectorService]: 'Public Sector Service',
  [OccupationCode.ForexDealer]: 'Forex Dealer',
  [OccupationCode.GovernmentService]: 'Government Service',
  [OccupationCode.UnknownOrNotApplicable]: 'Unknown / Not Applicable',
};

export enum AuthMode {
  'MOBILE' = 'M',
  'EMAIL' = 'E',
  'BOTH' = 'B',
}

export enum NominationAuthMode {
  OTP_AUTHENTICATION = 'O',
  DIGITAL_WET_SIGNATURE = 'W',
  ESIGN = 'E',
}

export enum BankAccountType {
  SAVINGS = 'SB',
  CURRENT = 'CA',
  CASH_CREDIT = 'CC',
  OVERDRAFT = 'OD',
  NRE = 'NE',
  NRO = 'NO',
}

export enum DepositoryCode {
  CDSL = 'CDSL',
  NSDL = 'NSDL',
}

export enum KYCType {
  KRA_COMPLIANT = 'K',
  CKYC_COMPLIANT = 'C',
  BIOMETRIC_KYC = 'B',
  AADHAAR_EKYC_PAN = 'E',
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: 'Male',
  [Gender.FEMALE]: 'Female',
  [Gender.OTHER]: 'Other',
};

export enum ContactType {
  RESIDENTIAL = 'RE',
  OFFICE = 'OF',
  PRIMARY = 'PR',
  OTHER = 'OT',
}

export enum IdentifierType {
  PAN = 'pan',
  PAN_EXEMPT_REF_NO = 'panexemptrefno',
  AADHAAR = 'aadhaar',
  PASSPORT = 'passport',
  DRIVING_LICENCE = 'drivinglicence',
  VOTER_ID = 'voterid',
  AOF = 'aof',
  FATCA_FORM = 'fatca_form',
  AOF_RIA = 'aof_ria',
  CANCEL_CHEQUE = 'cancelcheque',
  BANK_STATEMENT = 'bankstatement',
  BANK_LOG = 'banklog',
  CML_COPY = 'cmlcopy',
  NACH_SCAN_IMG = 'nachscanimg',
  NOMINATION_FORM = 'nominationform',
  WET_SIGNATURE = 'wetsignature',
  AADHAAR_ESIGN = 'aadhaaresign',
  ELOG = 'elog',
  SUPPORTING_DOCUMENT = 'supportingdocument',
}

// ===============================
// Order Module
// ===============================
export enum OrderType {
  PURCHASE = 'purchase',
  REDEMPTION = 'redemption',
  SWITCH = 'switch',
}

export enum OrderTypeCode {
  PURCHASE = 'p',
  REDEMPTION = 'r',
  SWITCH = 's',
}

export enum OrderSource {
  LUMPSUM = 'lumpsum',
  NFO = 'nfo',
  SIP = 'sip',
  SWP = 'swp',
  STP = 'stp',
}

export enum PhysicalOrDemat {
  PHYSICAL = 'p',
  DEMAT = 'd',
}

export enum OrderStatus {
  OPEN = 'o',
  CLOSED = 'c',
}

export enum OrderLifecycleStatus {
  SXP_ORDER_TRIGGERED = 'sxp_order_triggered',
  RECEIVED = 'received',
  OPS_REJECTED = 'ops_rejected',
  ORDER_2FA_PENDING = 'order_2fa_pending',
  BANK_TPV_PENDING = 'bank_tpv_pending',
  MATCH_PENDING = 'match_pending',
  MATCHED = 'matched',
  QUEUED_FOR_RTA = 'queued_for_rta',
  SENT_TO_RTA = 'sent_to_rta',
  RTA_ERROR = 'rta_error',
  RTA_RESP_RCVD = 'rta_resp_rcvd',
  UNITS_PAYOUT_SENT = 'units_payout_sent',
  DP_UNITS_MATCHED = 'dp_units_matched',
  UNITS_RTA_SETTLED = 'units_rta_settled',
  DONE = 'done',
  PARTIAL_UNITS_DONE = 'partial_units_done',
  REDEMPT_RTA_SETTLED = 'redempt_rta_settled',
  REDEMPT_EXCH_SETTLED = 'redempt_exch_settled',
  QUEUED_FOR_DP = 'queued_for_dp',
  RTA_REJECTED = 'rta_rejected',
  DP_REJECTED = 'dp_rejected',
  UCC_REJECTED = 'ucc_rejected',
  PLATFORM_REJECTED = 'platform_rejected',
  THRESHOLD_APPROVAL_PENDING = 'threshold_approval_pending',
  REFUND_PENDING = 'refund_pending',
  REFUND_APPROVED = 'refund_approved',
  EXCH_REFUND_INIT = 'exch_refund_init',
  EXCH_REFUND_DONE = 'exch_refund_done',
  EXCH_REFUND_ATTEMPTED = 'exch_refund_attempted',
  EXCH_REFUND_FAILED = 'exch_refund_failed',
  REDEMPT_PAYOUT_ATTEMPTED = 'redempt_payout_attempted',
  REDEMPT_PAYOUT_FAILED = 'redempt_payout_failed',
  REDEMPT_FUND_RETURNED_AMC = 'redempt_fund_returned_amc',
  FUNDS_TO_UNCLAIMED = 'funds_to_unclaimed',
  EXPIRED = 'expired',
}

//this order status internal is for our system internal tracking
export enum OrderStatusInternal {
  DRAFT = 'DRAFT',
}

export enum StatusInternal {
  DRAFT = 'DRAFT',
  FAILED = 'FAILED',
  SUBMITTED = 'SUBMITTED',
}

// ===============================
// SIP/SWP/STP Module
// ===============================
export enum SxPType {
  SIP = 'sip',
  SWP = 'swp',
  STP = 'stp',
  SPECIAL_PRODUCT = 'sprod',
  TOPUP = 'topup',
}

export enum SxPFrequency {
  DAILY = 'd',
  WEEKLY = 'w',
  MONTHLY = 'm',
  QUARTERLY = 'q',
  HALF_YEARLY = 'h',
  YEARLY = 'y',
}

export enum SxPStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum SxPCancelReason {
  NON_AVAILABILITY_OF_FUNDS = 'Non availability of Funds',
  SCHEME_NOT_PERFORMING = 'Scheme not performing',
  SERVICE_ISSUE = 'Service issue',
  LOAD_REVISED = 'Load Revised',
  WISH_TO_INVEST_IN_OTHER_SCHEMES = 'Wish to invest in other schemes',
  CHANGE_IN_FUND_MANAGER = 'Change in Fund Manager',
  GOAL_ACHIEVED = 'Goal Achieved',
  NOT_COMFORTABLE_WITH_MARKET_VOLATILITY = 'Not comfortable with market volatility',
  WILL_BE_RESTARTING_SIP_AFTER_FEW_MONTHS = 'Will be restarting SIP after few months',
  MODIFICATIONS_IN_BANK_MANDATE_DATE = 'Modifications in bank/mandate/date etc',
  I_HAVE_DECIDED_TO_INVEST_ELSEWHERE = 'I have decided to invest elsewhere',
  THIS_IS_NOT_THE_RIGHT_TIME_TO_INVEST = 'This is not the right time to invest',
  OTHERS = 'Others',
}

export const SxPCancelReasonMapping: Record<SxPCancelReason, number> = {
  [SxPCancelReason.NON_AVAILABILITY_OF_FUNDS]: 1,
  [SxPCancelReason.SCHEME_NOT_PERFORMING]: 2,
  [SxPCancelReason.SERVICE_ISSUE]: 3,
  [SxPCancelReason.LOAD_REVISED]: 4,
  [SxPCancelReason.WISH_TO_INVEST_IN_OTHER_SCHEMES]: 5,
  [SxPCancelReason.CHANGE_IN_FUND_MANAGER]: 6,
  [SxPCancelReason.GOAL_ACHIEVED]: 7,
  [SxPCancelReason.NOT_COMFORTABLE_WITH_MARKET_VOLATILITY]: 8,
  [SxPCancelReason.WILL_BE_RESTARTING_SIP_AFTER_FEW_MONTHS]: 9,
  [SxPCancelReason.MODIFICATIONS_IN_BANK_MANDATE_DATE]: 10,
  [SxPCancelReason.I_HAVE_DECIDED_TO_INVEST_ELSEWHERE]: 11,
  [SxPCancelReason.THIS_IS_NOT_THE_RIGHT_TIME_TO_INVEST]: 12,
  [SxPCancelReason.OTHERS]: 13,
};

// ===============================
// Mandate Module
// ===============================
export enum MandateType {
  UPI_AUTOPAY = 'U',
  ENACH = 'N',
  NACH = 'X',
}

export const MandateTypeLabel: Record<MandateType, string> = {
  [MandateType.UPI_AUTOPAY]: 'UPI Autopay',
  [MandateType.ENACH]: 'eNACH',
  [MandateType.NACH]: 'NACH',
};

export enum MandateMode {
  ACH = 'ACH',
  DIRECT_DEBIT = 'DD',
}

export enum MandateFrequency {
  AS_AND_WHEN_PRESENTED = 'AS AND WHEN PRESENTED',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
}

export enum MandateRequestType {
  REGISTRATION = 'REGISTRATION',
  ENTRY = 'ENTRY',
}

export enum MandateStatus {
  PENDING = 'P',
  VERIFIED = 'V',
  CANCELLED = 'C',
  REJECTED = 'R',
}

export const MandateStatusLabel: Record<MandateStatus, string> = {
  [MandateStatus.PENDING]: 'Pending',
  [MandateStatus.VERIFIED]: 'Verified',
  [MandateStatus.CANCELLED]: 'Cancelled',
  [MandateStatus.REJECTED]: 'Rejected',
};

// ===============================
// Payment Gateway Module
// ===============================
export enum PaymentMode {
  UPI = 'upi',
  NET_BANKING = 'netbanking',
  MANDATE = 'mandate',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  NACH = 'NACH',
  ENACH = 'ENACH',
  CHEQUE = 'CHEQUE',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
}

export enum PaymentGatewayRequestMethod {
  EXCHPG_PAGE = 'exchpg_page',
  PAYMENT_INFO_DATA = 'payment_info_data',
}

export enum PaymentStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'INPROGRESS',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum MISType {
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  UPI = 'UPI',
  UPI_RECURRING = 'UPIR',
  NACH = 'NACH',
  ENACH = 'ENACH',
  CHEQUE = 'CHEQUE',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
}

/**
 * Payment Gateway Event States
 * Tracks the lifecycle of payment processing through BSE Payment Gateway
 *
 * Event Flow:
 * exch_init → agency_pending → agency_inprocess → agency_approved/rejected → agency_payment_complete
 *
 * @see bulk-dump/bse.md - BSE Payment Gateway specification
 */
export enum PaymentGatewayEvent {
  EXCH_INIT = 'exch_init', // Payment initiated at exchange
  AGENCY_PENDING = 'agency_pending', // Payment request sent to agency, awaiting response
  AGENCY_INPROCESS = 'agency_inprocess', // Payment request in process at agency
  AGENCY_APPROVED = 'agency_approved', // Payment approved by agency (success)
  AGENCY_REJECTED = 'agency_rejected', // Payment rejected by agency (failure)
  AGENCY_CANCELLED = 'agency_cancelled', // Payment cancelled (no event triggered)
  AGENCY_PAYMENT_COMPLETE = 'agency_payment_complete', // Payment process completed (final state)
}

/**
 * Payment Gateway Event Labels
 * Human-readable descriptions for each payment event state
 */
export const PaymentGatewayEventLabel: Record<PaymentGatewayEvent, string> = {
  [PaymentGatewayEvent.EXCH_INIT]: 'Payment Initiated',
  [PaymentGatewayEvent.AGENCY_PENDING]: 'Awaiting Agency Response',
  [PaymentGatewayEvent.AGENCY_INPROCESS]: 'Processing at Agency',
  [PaymentGatewayEvent.AGENCY_APPROVED]: 'Payment Approved',
  [PaymentGatewayEvent.AGENCY_REJECTED]: 'Payment Rejected',
  [PaymentGatewayEvent.AGENCY_CANCELLED]: 'Payment Cancelled',
  [PaymentGatewayEvent.AGENCY_PAYMENT_COMPLETE]: 'Payment Completed',
};

/**
 * Payment Gateway Event Flow Codes
 * Numeric codes corresponding to each event state per BSE documentation
 */
export const PaymentGatewayEventFlowCode: Record<PaymentGatewayEvent, number> =
  {
    [PaymentGatewayEvent.EXCH_INIT]: 0,
    [PaymentGatewayEvent.AGENCY_PENDING]: 1,
    [PaymentGatewayEvent.AGENCY_INPROCESS]: 2,
    [PaymentGatewayEvent.AGENCY_APPROVED]: 3,
    [PaymentGatewayEvent.AGENCY_REJECTED]: 3,
    [PaymentGatewayEvent.AGENCY_CANCELLED]: 3,
    [PaymentGatewayEvent.AGENCY_PAYMENT_COMPLETE]: 4,
  };

// ===============================
// Webhook Events
// ===============================
// NOTE: WebhookEvent and WebhookEventCategory have been moved to WebhookEvent.ts
// for better organization and comprehensive event coverage (96 events).
// Import from: @/e-types/src/bse/enums/WebhookEvent
// This file previously contained a subset (40 events) - now deprecated.
// ===============================

// ===============================
// Error Codes
// ===============================
export enum ErrorCode {
  TOKEN_MISSING = '508',
  TOKEN_VERIFICATION_FAILED = '509',
  TOKEN_CACHE_FAILED = '510',
  UNABLE_TO_GET_TOKEN = '580',
  LOGIN_FAILED = '672',
  UNAUTHORIZED = '673',
  TOKEN_MEMBER_MISMATCH = '1023',
  REQUIRED = '522',
  INVALID_VALUE = '561',
  VALIDATION_FAILED = '1011',
  APPLICATION_ERROR = '1020',
  INVALID = '579',
  INVALID_AMOUNT = '3689',
  DUPLICATE_RECORD = '539',
  RECORD_NOT_FOUND = '1507',
  ID_NOT_EXIST = '1505',
  DETAIL_MISMATCH = '3896',
  PAYMENT_FAILED = '3707',
  BILLDESK_API_ERROR = '3708',
  ORDER_MAPPING_FAILED = '3709',
  RAZORPAY_FAILED = '3812',
  ORDER_CREATION_FAILED = '3813',
  ENDPOINT_NOT_FOUND = '3520',
  MISSING = '3517',
  ID_DOES_NOT_EXIST = '3663',
}

// ===============================
// Additional Enums
// ===============================
export enum Currency {
  INR = 'INR',
}

export enum VerificationStatus {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  PENDING = 'PENDING',
}

export enum RTACode {
  CAMS = 'CAMS',
  KFIN = 'KFIN',
  KARVY = 'KARVY',
  FRANKLIN = 'Franklin',
}

export enum YesNo {
  YES = 'Y',
  NO = 'N',
}

export enum APIEndpoint {
  LOGIN = '/api/login',
  ADD_UCC = '/v2/add_ucc',
  UPDATE_UCC = '/v2/update_ucc',
  GET_UCC = '/v2/get_ucc',
  LIST_UCC = '/v2/list_ucc',
  ORDER_NEW = '/order_new',
  ORDER_UPDATE = '/v2/order_update',
  ORDER_CANCEL = '/v2/order_cancel',
  ORDER_GET = '/v2/order_get',
  ORDER_LIST = '/v2/order_list',
  SXP_REGISTER = '/v2/sxp_register',
  SXP_CANCEL = '/v2/sxp_cancel',
  SXP_GET = '/v2/sxp_get',
  SXP_LIST = '/v2/sxp_list',
  MANDATE_REGISTER = '/v2/mandate_register',
  MANDATE_UPDATE = '/v2/mandate_update',
  MANDATE_CANCEL = '/v2/mandate_cancel',
  MANDATE_GET = '/v2/mandate_get',
  MANDATE_LIST = '/v2/mandate_list',
  MANDATE_LINK = '/v2/mandate_link',
  MANDATE_DELINK = '/v2/mandate_delink',
  GET_EXCHPG_SERVICE = '/v2/get_exchpg_service',
  SEND_PAYMENT_INFO = '/v2/send_payment_info',
  UPLOAD_MIS = '/v2/upload_mis',
  GET_PAYMENT_DETAIL = '/v2/get_payment_detail',
  SCHEME_LIST = '/v2/master_scheme_list',
  NAV_MASTER_LIST = '/v2/nav_master_list',
  GET_2FA_LINK = '/v2/get_2fa_link',
}

export enum ContentType {
  JSON = 'application/json',
  JOSE = 'application/jose',
}

// ===============================
// End of All BSE Enums
// ===============================

export enum WhoseContact {
  SELF = 'SE',
  SPOUSE = 'SP',
  DEPENDENT_CHILDREN = 'DC',
  DEPENDENT_SIBLINGS = 'DS',
  DEPENDENT_PARENTS = 'DP',
  GUARDIAN = 'GD',
  PMS = 'PM',
  CUSTODIAN = 'CD',
  POA = 'PO',
  NOT_APPLICABLE = 'NA',
}

export const WHoseContactLabel: Record<WhoseContact, string> = {
  [WhoseContact.SELF]: 'Self',
  [WhoseContact.SPOUSE]: 'Spouse',
  [WhoseContact.DEPENDENT_CHILDREN]: 'Dependent Children',
  [WhoseContact.DEPENDENT_SIBLINGS]: 'Dependent Siblings',
  [WhoseContact.DEPENDENT_PARENTS]: 'Dependent Parents',
  [WhoseContact.GUARDIAN]: 'Guardian',
  [WhoseContact.PMS]: 'PMS',
  [WhoseContact.CUSTODIAN]: 'Custodian',
  [WhoseContact.POA]: 'POA',
  [WhoseContact.NOT_APPLICABLE]: 'Not Applicable',
};

export enum CountryCode {
  INDIA = 'IND',
}

export enum PhoneCountryCode {
  INDIA = '91',
}

export enum BankAccOwner {
  SELF = 'SELF',
  GUARDIAN = 'GUARDIAN',
}

export enum FatcaInvestorType {
  INDIVIDUAL = 'Individual',
  ENTITY = 'Entity',
  NRI = 'NRI',
}

export enum FatcaAddressType {
  RESIDENTIAL_OR_BUSINESS = '1',
  RESIDENTIAL = '2',
  BUSINESS = '3',
  REGISTERED_OFFICE = '4',
  UNSPECIFIED = '5',
  RESIDENT_OR_BUSINESS_FOREIGN = '6',
  RESIDENTIAL_FOREIGN = '7',
  BUSINESS_FOREIGN = '8',
  REGISTERED_OFFICE_FOREIGN = '9',
  UNSPECIFIED_FOREIGN = '10',
}

export const FatcaAddressTypeLabel: Record<FatcaAddressType, string> = {
  [FatcaAddressType.RESIDENTIAL_OR_BUSINESS]: 'Residential or Business',
  [FatcaAddressType.RESIDENTIAL]: 'Residential',
  [FatcaAddressType.BUSINESS]: 'Business',
  [FatcaAddressType.REGISTERED_OFFICE]: 'Registered Office',
  [FatcaAddressType.UNSPECIFIED]: 'Unspecified',
  [FatcaAddressType.RESIDENT_OR_BUSINESS_FOREIGN]:
    'Resident Or Business Foreign',
  [FatcaAddressType.RESIDENTIAL_FOREIGN]: 'Residential Foreign',
  [FatcaAddressType.BUSINESS_FOREIGN]: 'Business Foreign',
  [FatcaAddressType.REGISTERED_OFFICE_FOREIGN]: 'Registered Office Foreign',
  [FatcaAddressType.UNSPECIFIED_FOREIGN]: 'Unspecified Foreign',
};

export enum FatcaOccType {
  BUSINESS = 'B',
  SERVICE = 'S',
  OTHERS = 'O',
}

export enum FatcaTaxStatus {
  INDIVIDUAL = 'Individual',
  COMPANY = 'Company',
}

export enum CorporateServiceSector {
  FOREIGN_EXCHANGE_MONEY_CHANGER_SERVICES = '1',
  GAMING_GAMBLING_LOTTERY_SERVICES = '2',
  MONEY_LAUNDERING_PAWNING = '3',
  NOT_APPLICABLE = '4',
}

export enum WealthSource {
  SALARY = '1',
  BUSINESS_INCOME = '2',
  GIFT = '3',
  ANCESTRAL_PROPERTY = '4',
  RENTAL_INCOME = '5',
  PRIZE_MONEY = '6',
  ROYALTY = '7',
  OTHERS = '8',
}

export const WealthSourceLabel: Record<WealthSource, string> = {
  [WealthSource.SALARY]: 'Salary',
  [WealthSource.BUSINESS_INCOME]: 'Business Income',
  [WealthSource.GIFT]: 'Gift',
  [WealthSource.ANCESTRAL_PROPERTY]: 'Ancestral Property',
  [WealthSource.RENTAL_INCOME]: 'Rental Income',
  [WealthSource.PRIZE_MONEY]: 'Prize Money',
  [WealthSource.ROYALTY]: 'Royalty',
  [WealthSource.OTHERS]: 'Others',
};

export enum IncomeSlab {
  BELOW_1_LAKH = '31',
  GREATER_THAN_1_LESS_EQUAL_5_LACS = '32',
  GREATER_THAN_5_LESS_EQUAL_10_LACS = '33',
  GREATER_THAN_10_LESS_EQUAL_25_LACS = '34',
  GREATER_THAN_25_LESS_EQUAL_1_CRORE = '35',
  ABOVE_1_CRORE = '36',
}

export const IncomeSlabLabel: Record<IncomeSlab, string> = {
  [IncomeSlab.BELOW_1_LAKH]: 'Below 1 Lakh',
  [IncomeSlab.GREATER_THAN_1_LESS_EQUAL_5_LACS]: '1 Lakh to 5 Lakhs',
  [IncomeSlab.GREATER_THAN_5_LESS_EQUAL_10_LACS]: '5 Lakhs to 10 Lakhs',
  [IncomeSlab.GREATER_THAN_10_LESS_EQUAL_25_LACS]: '10 Lakhs to 25 Lakhs',
  [IncomeSlab.GREATER_THAN_25_LESS_EQUAL_1_CRORE]: '25 Lakhs to 1 Crore',
  [IncomeSlab.ABOVE_1_CRORE]: 'Above 1 Crore',
};

export enum PoliticallyExposed {
  YES = 'Y',
  NO = 'N',
  RELATIVE = 'R',
}

export const PoliticallyExposedLabel: Record<PoliticallyExposed, string> = {
  [PoliticallyExposed.YES]: 'The investor is a politically exposed person',
  [PoliticallyExposed.NO]: 'The investor is not a politically exposed person',
  [PoliticallyExposed.RELATIVE]:
    'The investor is a relative of a politically exposed person',
};

export enum FatcaDataSource {
  PHYSICAL = 'P',
  ELECTRONICALLY = 'E',
}

export const FatcaDataSourceLabel: Record<FatcaDataSource, string> = {
  [FatcaDataSource.PHYSICAL]: 'Physical',
  [FatcaDataSource.ELECTRONICALLY]: 'Electronically',
};

export enum FatcaIdentifierType {
  PASSPORT = 'A',
  ELECTION_ID = 'B',
  PAN_CARD = 'C',
  ID_CARD = 'D',
  DRIVING_LICENSE = 'E',
  UIDAI_AADHAR_LETTER = 'G',
  NREGA_JOB_CARD = 'H',
  OTHERS = 'O',
  NOT_CATEGORIZED = 'X',
  TIN = 'T',
  COMPANY_IDENTIFICATION_NUMBER = 'C1',
  US_GIIN = 'G1',
  GLOBAL_ENTITY_IDENTIFICATION_NUMBER = 'E1',
}

export const FatcaIdentifierTypeLabel: Record<FatcaIdentifierType, string> = {
  [FatcaIdentifierType.PASSPORT]: 'Passport',
  [FatcaIdentifierType.ELECTION_ID]: 'Election ID Card',
  [FatcaIdentifierType.PAN_CARD]: 'PAN Card',
  [FatcaIdentifierType.ID_CARD]: 'ID Card',
  [FatcaIdentifierType.DRIVING_LICENSE]: 'Driving License',
  [FatcaIdentifierType.UIDAI_AADHAR_LETTER]: 'UIDIA / Aadhar letter',
  [FatcaIdentifierType.NREGA_JOB_CARD]: 'NREGA Job Card',
  [FatcaIdentifierType.OTHERS]: 'Others',
  [FatcaIdentifierType.NOT_CATEGORIZED]: 'Not categorized',
  [FatcaIdentifierType.TIN]: 'TIN [Tax Payer Identification Number]',
  [FatcaIdentifierType.COMPANY_IDENTIFICATION_NUMBER]:
    'Company Identification Number',
  [FatcaIdentifierType.US_GIIN]: 'US GIIN',
  [FatcaIdentifierType.GLOBAL_ENTITY_IDENTIFICATION_NUMBER]:
    'Global Entity Identification Number',
};

// ===============================
// FATCA Entity Types (FFI / DRNFE)
// ===============================
export enum FatcaEntityType {
  FFI = 'FFI',
  DRNFE = 'DRNFE',
}

export const FatcaEntityTypeLabel: Record<FatcaEntityType, string> = {
  [FatcaEntityType.FFI]: 'Foreign Financial Institution (FFI)',
  [FatcaEntityType.DRNFE]: 'Deemed/Relevant Non-Financial Entity (DRNFE)',
};

export enum FatcaGiinAvailability {
  APPLIED_FOR = 'AF',
  NOT_REQUIRED = 'NR',
  NOT_OBTAINED = 'NO',
}

export const FatcaGiinAvailabilityLabel: Record<FatcaGiinAvailability, string> =
  {
    [FatcaGiinAvailability.APPLIED_FOR]: 'Applied for',
    [FatcaGiinAvailability.NOT_REQUIRED]: 'Not required to apply for',
    [FatcaGiinAvailability.NOT_OBTAINED]: 'Not obtained - Non-participating FI',
  };

export enum MaritalStatus {
  SINGLE = 'S',
  MARRIED = 'M',
}

export const MaritalStatusLabel: Record<MaritalStatus, string> = {
  [MaritalStatus.SINGLE]: 'Single',
  [MaritalStatus.MARRIED]: 'Married',
};
