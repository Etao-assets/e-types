import { z } from 'zod';

export const GoalInvitationStatusSchema = z.enum(['PENDING', 'ACTIVE']);

export const GroupInvitationMemberSchema = z.object({
  status: GoalInvitationStatusSchema,
  name: z.string().nullable(),
  phone: z.string().nullable(),
  isCreator: z.boolean(),
});

export const FetchGroupMembersResponseSchema = z.object({
  invitations: z.array(GroupInvitationMemberSchema),
});

export type GoalInvitationStatus = z.infer<typeof GoalInvitationStatusSchema>;
export type GroupInvitationMember = z.infer<typeof GroupInvitationMemberSchema>;
export type GroupInvitationStatus = GroupInvitationMember['status'];
export type FetchGroupMembersResponse = z.infer<
  typeof FetchGroupMembersResponseSchema
>;
