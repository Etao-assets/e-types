import { z } from 'zod';

/// Lifecycle states for an invite consent request.
export enum InviteConsentStatus {
  DRAFT = 'DRAFT', // Consent request created but not yet sent to invitees
  SENT = 'SENT', // Sent to all invitees, awaiting responses
  EXPIRED = 'EXPIRED', // Consent window has passed
  FAILED = 'FAILED', // Failed to send or process consent request
  ALL_ACCEPTED = 'ALL_ACCEPTED', // Every invitee accepted
  PARTIAL_ACCEPT = 'PARTIAL_ACCEPT', // At least one invitee accepted; others declined or pending
}

/// Represents the consent member status of an individual active member
export enum ConsentMemberStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export enum ConsentResponseType {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

/// Zod schema for sending an invite consent request.
export const RespondToConsentSchema = z.object({
  id: z.string().min(1, 'Invite consent ID is required'),
  status: z.nativeEnum(ConsentResponseType),
});

export type RespondToConsentInput = z.infer<typeof RespondToConsentSchema>;

export const SendInviteConsentSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  members: z
    .array(
      z.object({
        phone: z.string().min(10, 'Phone number must be at least 10 digits'),
        name: z.string().optional(),
      }),
    )
    .min(1, 'At least one member is required'),
});

export type SendInviteConsentInput = z.infer<typeof SendInviteConsentSchema>;

