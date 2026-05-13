import { PaginatedResponse } from './api';
import { InvestmentGoalTypeExtra } from './goalType';

// Order & Investment
export const NotificationType = {
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ORDER_FAILED: 'ORDER_FAILED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  REDEMPTION_INITIATED: 'REDEMPTION_INITIATED',
  REDEMPTION_COMPLETED: 'REDEMPTION_COMPLETED',
  REDEMPTION_FAILED: 'REDEMPTION_FAILED',
  // SIP
  SIP_CREATED: 'SIP_CREATED',
  SIP_ACTIVATED: 'SIP_ACTIVATED',
  SIP_CANCELLED: 'SIP_CANCELLED',
  SIP_INSTALLMENT_SUCCESS: 'SIP_INSTALLMENT_SUCCESS',
  SIP_INSTALLMENT_FAILED: 'SIP_INSTALLMENT_FAILED',
  // Mandate
  MANDATE_REGISTERED: 'MANDATE_REGISTERED',
  MANDATE_APPROVED: 'MANDATE_APPROVED',
  MANDATE_REJECTED: 'MANDATE_REJECTED',
  MANDATE_CANCELLED: 'MANDATE_CANCELLED',
  // UCC
  UCC_SUBMITTED: 'UCC_SUBMITTED',
  UCC_APPROVED: 'UCC_APPROVED',
  UCC_REJECTED: 'UCC_REJECTED',
  // Goal
  GOAL_CREATED: 'GOAL_CREATED',
  GOAL_MILESTONE_REACHED: 'GOAL_MILESTONE_REACHED',
  GOAL_COMPLETED: 'GOAL_COMPLETED',
  // Community Goal
  COMMUNITY_GOAL_JOINED: 'COMMUNITY_GOAL_JOINED',
  COMMUNITY_GOAL_UPDATED: 'COMMUNITY_GOAL_UPDATED',
  COMMUNITY_GOAL_CANCELLED: 'COMMUNITY_GOAL_CANCELLED',
  // General
  GENERAL: 'GENERAL',
  GROUP_GOAL_INVITATION: 'GROUP_GOAL_INVITATION',
  // Invite Consent
  INVITE_CONSENT: 'INVITE_CONSENT',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationEntityType = {
  ORDER: 'order',
  SIP: 'sip',
  MANDATE: 'mandate',
  UCC: 'ucc',
  GOAL: 'goal',
  COMMUNITY_GOAL: 'communityGoal',
  CONSENT: 'consent',
} as const;

export type NotificationEntityType = (typeof NotificationEntityType)[keyof typeof NotificationEntityType];

export interface NotificationItem {
  id: string;
  userId: string | null;
  email?: string | null;
  phone?: string | null;
  type: NotificationType;
  title: string;
  description: string;
  icon?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalInviteMetadata {
  invitationId: string;
  inviteType: InvestmentGoalTypeExtra;
}

export type NotificationListResponse = PaginatedResponse<NotificationItem>;

export interface UnreadCountResponse {
  count: number;
}

export interface CreateNotificationInput {
  userId?: string;
  email?: string;
  phone?: string;
  type: NotificationType;
  title: string;
  description: string;
  icon?: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}
