/**
 * Investment Goal Details response shape — returned by getInvestmentGoalDetails.
 * Covers individual goals, group goals (custom and community-linked).
 *
 * NOTE: All `Decimal` financial values are serialised to `number` at the API boundary.
 *       Do not use floating-point arithmetic on these values; round at the display layer.
 */

import { z } from 'zod';

import { NotAvailableShortSchema } from './nullValue';

// --- Enums ---

/** Three-way goal type classifier (extends the two-value Prisma GoalType) */
export enum GoalTypeDetailedEnum {
  INDIVIDUAL_GOAL      = 'INDIVIDUAL_GOAL',
  CUSTOM_GROUP_GOAL    = 'CUSTOM_GROUP_GOAL',
  COMMUNITY_GROUP_GOAL = 'COMMUNITY_GROUP_GOAL',
}

/** Role of a member within a group goal */
export enum MemberRoleEnum {
  CREATOR = 'CREATOR',
  MEMBER  = 'MEMBER',
}

/** Invitation status for a member entry inside memberManagement */
export enum MemberInvitationStatusEnum {
  PENDING  = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED  = 'EXPIRED',
}

// --- Sub-schemas (exported for independent use by consumers) ---

const GoalTypeDetailedSchema = z.nativeEnum(GoalTypeDetailedEnum);
const MemberRoleSchema        = z.nativeEnum(MemberRoleEnum);
const MemberInvitationStatusSchema = z.nativeEnum(MemberInvitationStatusEnum);

/** Core investment goal fields */
export const InvestmentGoalDetailCoreSchema = z.object({
  id:                   z.string(),
  type:                 z.string(),
  name:                 z.string().nullable(),
  description:          z.string().nullable(),
  targetAmt:            z.number(), // Decimal — financial value; do not use as Float
  targetDate:           z.coerce.date().nullable(),
  investedAmt:          z.number(), // Decimal
  sipInstallment:       z.number(), // Decimal
  tenure:               z.number().int().nullable(),
  milestones:           z.unknown().nullable(),
  status:               z.string(),
  goalType:             z.enum(['INDIVIDUAL_GOAL', 'GROUP_GOAL']),
  goalTypeDetailed:     GoalTypeDetailedSchema,
  userId:               z.string(),
  communityGoalId:      z.string().nullable(),
  communityGoalGroupId: z.string().nullable(),
  isGroupCreator:       z.boolean(),
  orderId:              z.string().nullable(),
  createdAt:            z.coerce.date(),
  updatedAt:            z.coerce.date(),
  productType:          z.string().nullable().optional(), // Fixerra deposit product ("FD"|"RD"|"SA"); null for non-Fixerra goals
});

/** Per-member (individual) computed portfolio */
export const IndividualPortfolioSchema = z.object({
  remainingAmt:          z.number(), // Decimal
  completionPercentage:  z.number(),
  currentValue:          z.number(), // Decimal
  source:                NotAvailableShortSchema,
  fetchedAt:             z.coerce.date().nullable(),
  day1Return:            z.number(),
  totalReturn:           z.number(),
  holdingsCount:         z.number().int(),
});

/** Aggregated group portfolio fields (null for individual goals) */
export const GroupPortfolioSchema = z.object({
  activeMembersCount:        z.number().int(),
  perMemberTargetAmt:        z.number(), // Decimal
  perMemberSipInstallment:   z.number(), // Decimal
  groupTargetAmt:            z.number(), // Decimal
  groupSipInstallment:       z.number(), // Decimal
  totalInvestedByGroup:      z.number(), // Decimal
  groupRemainingAmt:         z.number(), // Decimal
  groupCompletionPercentage: z.number(), // Decimal — rounded to 2 dp
  totalCurrentValue:         z.number(), // Decimal
  source:                    NotAvailableShortSchema,
  fetchedAt:                 z.coerce.date().nullable(),
  day1Return:                z.number(),
  totalReturn:               z.number(),
  holdingsCount:             z.number().int(),
});

/** Merged SIP projection + BSE registration record */
export const SipDetailSchema = z.object({
  // Calculated SIP projection (0 when no targetDate or calculation fails)
  monthlySIP:      z.number(), // Decimal
  totalMonths:     z.number().int(),
  totalInvestment: z.number(), // Decimal
  expectedReturns: z.number(), // Decimal
  // BSE SIP registration (null when user has not registered a SIP)
  id:              z.string().nullable(),
  bseSxpRegNum:    z.string().nullable(),
  memSxpRegNum:    z.string().nullable(),
  status:          z.string().nullable(),
  amount:          z.number(), // Decimal — 0 when no SIP registered
});

/** Linked lumpsum order (null when no order) */
export const OrderDetailSchema = z.object({
  id:         z.string(),
  bseOrderId: z.string().nullable(),
  status:     z.string(),
});

/** Community goal metadata attached to the response */
export const CommunityGoalDetailSchema = z.object({
  id:                 z.string(),
  name:               z.string(),
  description:        z.string(),
  bannerImageUrl:     z.string().nullable(),
  bannerThumbnailUrl: z.string().nullable(),
  days:               z.number().int(),
  nights:             z.number().int(),
  startDate:          z.coerce.date().nullable(),
  endDate:            z.coerce.date().nullable(),
  city:               z.string().nullable(),
  state:              z.string().nullable(),
  status:             z.string(),
  category: z.object({
    id:   z.string(),
    name: z.string(),
    slug: z.string(),
    icon: z.string().nullable(),
  }),
  agency: z.object({
    id:      z.string(),
    name:    z.string(),
    logoUrl: z.string().nullable(),
  }).nullable(),
});

/** Group metadata (no financials — those live in portfolio.group) */
export const GroupDetailSchema = z.object({
  id:         z.string(),
  name:       z.string(),
  description: z.string().nullable(),
  creatorId:  z.string(),
  isPrivate:  z.boolean(),
  maxMembers: z.number().int().nullable(),
  createdAt:  z.coerce.date(),
});

/** A single entry in the memberManagement.members array.
 *  Confirmed members carry investmentGoalId/investedAmount/targetAmt.
 *  Pending/declined invitations carry invitationId/inviteCode/sentAt/etc.
 */
export const MemberEntrySchema = z.object({
  userId:           z.string().nullable(),
  name:             z.string().nullable(),
  email:            z.string().nullable(),
  phone:            z.string().nullable(),
  role:             MemberRoleSchema,
  invitationStatus: MemberInvitationStatusSchema,
  memberStatus:     z.string().nullable(),
  isCreator:        z.boolean(),
  // Confirmed-member fields
  investmentGoalId: z.string().optional(),
  investedAmount:   z.number().optional(), // Decimal
  joinedAt:         z.coerce.date().nullable().optional(),
  targetAmt:        z.number().nullable().optional(), // Decimal
  // Invitation-specific fields
  invitationId:  z.string().optional(),
  inviteCode:    z.string().optional(),
  sentAt:        z.coerce.date().nullable().optional(),
  respondedAt:   z.coerce.date().nullable().optional(),
  expiresAt:     z.coerce.date().nullable().optional(),
  invitedBy:     z.object({ id: z.string(), name: z.string().nullable() }).optional(),
});

/** Count breakdown for memberManagement */
export const MemberCountsSchema = z.object({
  total:    z.number().int(),
  active:   z.number().int(),
  pending:  z.number().int(),
  declined: z.number().int(),
  expired:  z.number().int(),
});

/** Owner — the investment goal owner (individual) or the group creator */
export const OwnerSchema = z.object({
  id:             z.string(),
  name:           z.string().nullable(),
  email:          z.string().nullable(),
  isGroupCreator: z.boolean().optional(),
});

// --- Root response schema ---

/** Full response shape of CommunityGoalUserService.getInvestmentGoalDetails */
export const InvestmentGoalDetailsResponseSchema = z.object({
  investmentGoal: InvestmentGoalDetailCoreSchema,
  portfolio: z.object({
    individual: IndividualPortfolioSchema,
    group:      GroupPortfolioSchema.nullable(),
  }),
  sip:               SipDetailSchema,
  order:             OrderDetailSchema.nullable(),
  communityGoal:     CommunityGoalDetailSchema.optional(),
  group:             GroupDetailSchema.optional(),
  memberManagement: z.object({
    members:      z.array(MemberEntrySchema),
    memberCounts: MemberCountsSchema,
  }).optional(),
  owner:              OwnerSchema.nullable(),
});

// --- Inferred Types ---

export type GoalTypeDetailed      = z.infer<typeof GoalTypeDetailedSchema>;
export type MemberRole            = z.infer<typeof MemberRoleSchema>;
export type MemberInvitationStatus = z.infer<typeof MemberInvitationStatusSchema>;

export type InvestmentGoalDetailCore = z.infer<typeof InvestmentGoalDetailCoreSchema>;
export type IndividualPortfolio      = z.infer<typeof IndividualPortfolioSchema>;
export type GroupPortfolio           = z.infer<typeof GroupPortfolioSchema>;
export type SipDetail                = z.infer<typeof SipDetailSchema>;
export type OrderDetail              = z.infer<typeof OrderDetailSchema>;
export type CommunityGoalDetail      = z.infer<typeof CommunityGoalDetailSchema>;
export type GroupDetail              = z.infer<typeof GroupDetailSchema>;
export type MemberEntry              = z.infer<typeof MemberEntrySchema>;
export type MemberCounts             = z.infer<typeof MemberCountsSchema>;
export type Owner                    = z.infer<typeof OwnerSchema>;

export type InvestmentGoalDetailsResponse = z.infer<typeof InvestmentGoalDetailsResponseSchema>;
