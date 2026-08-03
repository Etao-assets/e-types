import { any, z } from 'zod';

/**
 * Community Goal Schemas and Types
 *
 * Zod schemas for validation and TypeScript types for the Community Goal feature.
 * Matches backend Prisma models and mock API data structure.
 */

// ============================================================================
// ENUMS - Must match Prisma schema exactly
// ============================================================================

export const CommunityGoalStatusEnum = z.enum([
  'DRAFT', // Goal being created, not visible to others
  'OPEN', // Goal published and accepting participants
  'IN_PROGRESS', // Goal started, participants confirmed
  'COMPLETED', // Goal trip/event completed
  'CANCELLED', // Goal cancelled
  'ARCHIVED', // Final state, read-only
]);

export const CommunityGoalDateSelectionTypeEnum = z.enum([
  'ANY_DATE', // User can pick any date
  'SPECIFIC_MONTHS', // Limited to certain months
  'PREDEFINED_DATES', // Only specific date ranges allowed
]);

export const ParticipationStatusEnum = z.enum([
  'PENDING', // User expressed interest, not confirmed
  'CONFIRMED', // User confirmed participation
  'PAID', // User completed payment
  'CANCELLED', // User cancelled participation
  'REJECTED', // Organizer rejected participation
]);

export const InvitationStatusEnum = z.enum([
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
]);

export const ContributionStatusEnum = z.enum([
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);

export const ReviewStatusEnum = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'FLAGGED', // Review flagged for review
]);

// UI-specific enum for group member status (used in UI for simpler member management)
export const GroupMemberStatusEnum = z.enum(['active', 'pending', 'declined']);

// ============================================================================
// CORE SCHEMAS
// ============================================================================

// Duration display helper - formats days/nights for UI display
export const formatDuration = (days: number, nights: number): string => {
  return `${days} Day${days > 1 ? 's' : ''} / ${nights} Night${
    nights > 1 ? 's' : ''
  }`;
};

// ============================================================================
// RELATED ENTITY SCHEMAS
// ============================================================================

// Agency schema - matches backend Prisma Agency model
export const agencySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  contactPerson: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  socialMedia: z.record(z.string()).optional().nullable(), // {facebook: "", instagram: "", twitter: ""}
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Brand schema - matches backend Prisma Brand model.
// A Brand is the consumer-facing name shown on a goal card (e.g. "Endeavour
// Ladakh"). It is distinct from an Agency, which is the operator running the
// trip. Only `name` is guaranteed - every other field is filled in over time.
export const brandSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  // E.164 digits, no '+' or spaces - spliced into https://wa.me/<number>
  whatsappNumber: z.string().optional().nullable(),
  // The "Connect with brand" CTA stays hidden until this is true
  whatsappEnabled: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Category schema
export const communityGoalCategorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// SubCategory schema
export const communityGoalSubCategorySchema = z.object({
  id: z.string().cuid(),
  categoryId: z.string().cuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Itinerary schema - CMS-style with minimal fields
// All content data is stored in the 'content' JSON field
export const communityGoalItinerarySchema = z.object({
  id: z.string().cuid().optional(),
  communityGoalId: z.string().cuid().optional(),

  // Publishing control
  isActive: z.boolean().default(true),

  // Flexible CMS content field - stores all itinerary data as JSON
  content: z.any().optional(), // for now

  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

// Available Date schema - matches backend Prisma schema
export const communityGoalAvailableDateSchema = z.object({
  id: z.string().cuid().optional(),
  communityGoalId: z.string().cuid().optional(),
  startDate: z.date().or(z.string()),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

// Available Month schema - for month-based date selection
export const communityGoalAvailableMonthSchema = z.object({
  id: z.string().cuid().optional(),
  communityGoalId: z.string().cuid().optional(),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()).optional(),
});

// Package/Pricing Tier schema - matches backend Prisma schema
export const communityGoalPackageSchema = z.object({
  id: z.string().cuid().optional(),
  communityGoalId: z.string().cuid().optional(),
  label: z.string().min(1), // "Standard", "Premium", "Deluxe"
  description: z.string().optional().nullable(),
  amount: z.number().positive(),
  isDefault: z.boolean().default(false),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

// Service schema - matches backend Prisma schema
export const communityGoalServiceSchema = z.object({
  id: z.string().cuid(),
  communityGoalId: z.string().cuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  cost: z.number().optional().nullable(), // Null if included
  isRequired: z.boolean().default(false).optional(),
  icon: z.string().optional().nullable(),
  order: z.number().int().default(0).optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Review schema - matches backend Prisma schema (commented out in Prisma)
export const communityGoalReviewSchema = z.object({
  id: z.string().cuid(),
  communityGoalId: z.string().cuid(),
  participationId: z.string().cuid(),
  userId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  images: z.array(z.string()).default([]).optional(),
  videos: z.array(z.string()).default([]).optional(),
  status: ReviewStatusEnum.default('PENDING').optional(),
  moderatedBy: z.string().cuid().optional().nullable(),
  moderatedAt: z.date().or(z.string()).optional().nullable(),
  moderationNotes: z.string().optional().nullable(),
  helpfulCount: z.number().int().min(0).default(0).optional(),
  reportCount: z.number().int().min(0).default(0).optional(),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

// Participation schema - matches backend Prisma schema (commented out in Prisma)
export const communityGoalParticipationSchema = z.object({
  id: z.string().cuid(),
  communityGoalId: z.string().cuid(),
  userId: z.string().cuid(),
  status: ParticipationStatusEnum,
  selectedDateId: z.string().cuid().optional().nullable(),
  groupId: z.string().cuid().optional().nullable(),
  totalCommitted: z.number().min(0).default(0),
  totalPaid: z.number().min(0).default(0),
  totalRefunded: z.number().min(0).default(0),
  joinedAt: z.date().or(z.string()),
  confirmedAt: z.date().or(z.string()).optional().nullable(),
  withdrawnAt: z.date().or(z.string()).optional().nullable(),
  completedAt: z.date().or(z.string()).optional().nullable(),
  preferences: z.record(z.any()).optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Group schema - matches backend Prisma schema (removed inviteCode)
export const communityGoalGroupSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  creatorId: z.string().cuid(),
  communityGoalId: z.string().cuid().optional().nullable(),
  maxMembers: z.number().int().positive().optional().nullable(),
  isPrivate: z.boolean().default(false),
  investmentGoalId: z.string().cuid().optional().nullable(), // 1:1 with InvestmentGoal for GROUP_GOAL
  backgroundImageUrl: z.string().nullable().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Invitation schema - matches backend Prisma schema (groupId now optional)
export const communityGoalInvitationSchema = z.object({
  id: z.string().cuid(),
  groupId: z.string().cuid().optional().nullable(), // Optional during invitation creation
  inviterId: z.string().cuid(),
  inviteeId: z.string().cuid().optional().nullable(),
  inviteeEmail: z.string().email().optional().nullable(),
  inviteePhone: z.string().optional().nullable(),
  status: InvitationStatusEnum,
  message: z.string().optional().nullable(),
  expiresAt: z.date().or(z.string()).optional().nullable(),
  sentAt: z.date().or(z.string()),
  respondedAt: z.date().or(z.string()).optional().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// Contribution schema - matches backend Prisma schema (commented out in Prisma)
export const communityGoalContributionSchema = z.object({
  id: z.string().cuid(),
  participationId: z.string().cuid(),
  userId: z.string().cuid(),
  amount: z.number().positive(),
  status: ContributionStatusEnum,
  paymentMethod: z.string().optional().nullable(),
  transactionId: z.string().optional().nullable(),
  paymentGatewayRef: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  paidAt: z.date().or(z.string()).optional().nullable(),
  refundedAt: z.date().or(z.string()).optional().nullable(),
  refundAmount: z.number().optional().nullable(),
  refundReason: z.string().optional().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

// ============================================================================
// UI-SPECIFIC SCHEMAS (for frontend workflows)
// ============================================================================

// Group member schema - individual member within a group (UI view)
export const groupMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: GroupMemberStatusEnum,
  invitedDate: z.string(), // ISO date string
  avatar: z.string().optional(), // URL to avatar image
});

// Group stats schema - aggregate stats for a group
export const groupStatsSchema = z.object({
  activeMembers: z.number().int().min(0),
  pendingInvites: z.number().int().min(0),
});

// Service item schema - for wedding/event goals with service selection
export const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
});

// Service section schema - grouped services (e.g., "SERVICES/PACKAGES", "ADDITIONAL SERVICES")
export const serviceSectionSchema = z.object({
  title: z.string(),
  items: z.array(serviceItemSchema),
});

// Select services schema - complete service selection structure for wedding goals
export const selectServicesSchema = z.object({
  sections: z.array(serviceSectionSchema),
});

// ============================================================================
// MAIN COMMUNITY GOAL SCHEMA
// ============================================================================

export const communityGoalSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  slug: z.string().min(1), // SEO-friendly URL
  description: z.string(),

  // Category and subcategory
  categoryId: z.string().cuid(),
  categoryName: z.string().optional(), // Denormalized for API responses
  category: z.string().optional(), // Alias for categoryId in some responses

  // Subcategory (optional second-level classification)
  subCategoryId: z.string().cuid().optional().nullable(),
  subCategoryName: z.string().optional(), // Denormalized for API responses

  // Agency providing this goal (REQUIRED in Prisma, not optional)
  agencyId: z.string().cuid(),
  agencyName: z.string().optional(), // Denormalized for API responses

  // Brand fronting this goal (OPTIONAL - the agency above remains the operator)
  brandId: z.string().cuid().optional().nullable(),
  brandName: z.string().optional(), // Denormalized for API responses

  // Marketing copy
  subtitleShort: z.string().optional().nullable(),
  subtitleLong: z.string().optional().nullable(),

  // Visual assets
  bannerImageUrl: z.string().optional().nullable(),
  bannerThumbnailUrl: z.string().optional().nullable(),
  bannerVideoUrl: z.string().optional().nullable(),
  galleryImages: z.array(z.string()).default([]).optional(),

  // Duration (for filtering and queries)
  // Standard travel industry format: "5 Days / 4 Nights"
  days: z.number().int().positive(), // Number of days (e.g., 5 for a 5-day trip)
  nights: z.number().int().min(0), // Number of nights (e.g., 4 for 4 nights stay)

  // Location and media
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Date selection configuration
  dateSelectionType:
    CommunityGoalDateSelectionTypeEnum.default('PREDEFINED_DATES').optional(),

  // Goal metadata
  maxParticipants: z.number().int().positive().optional().nullable(),
  minParticipants: z.number().int().positive().default(1).optional(),
  minAge: z.number().int().positive().optional().nullable(),
  maxAge: z.number().int().positive().optional().nullable(),

  // Timeline
  startDate: z.date().or(z.string()).optional().nullable(),
  endDate: z.date().or(z.string()).optional().nullable(),
  registrationDeadline: z.date().or(z.string()).optional().nullable(),

  // Status and visibility
  status: CommunityGoalStatusEnum.default('DRAFT').optional(),
  isFeatured: z.boolean().default(false).optional(),

  // SEO and discovery
  tags: z.array(z.string()).default([]).optional(),

  // Admin-only fields (all optional for backward compatibility)
  internalNotes: z.string().optional().nullable(),
  approvedBy: z.string().cuid().optional().nullable(),
  approvedAt: z.date().or(z.string()).optional().nullable(),
  rejectionReason: z.string().optional().nullable(),

  // User who created this goal
  createdBy: z.string().cuid().optional().nullable(),

  // Last user who updated this goal
  updatedBy: z.string().cuid().optional().nullable(),

  // Timestamps
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
  publishedAt: z.date().or(z.string()).optional().nullable(),
  completedAt: z.date().or(z.string()).optional().nullable(),
});

// Schema with relations - for detailed API responses
export const communityGoalWithRelationsSchema = communityGoalSchema.extend({
  category: communityGoalCategorySchema.optional(),
  subCategory: communityGoalSubCategorySchema.optional().nullable(),
  agency: agencySchema.optional(), // Agency providing this goal
  brand: brandSchema.optional().nullable(), // Brand fronting this goal, if any
  itinerary: z.array(communityGoalItinerarySchema).default([]).optional(),
  availableDates: z
    .array(communityGoalAvailableDateSchema)
    .default([])
    .optional(),
  availableMonths: z
    .array(communityGoalAvailableMonthSchema)
    .default([])
    .optional(),
  packages: z.array(communityGoalPackageSchema).default([]).optional(),
  services: z.array(communityGoalServiceSchema).default([]).optional(),
  participations: z
    .array(communityGoalParticipationSchema)
    .default([])
    .optional(),
  groups: z.array(communityGoalGroupSchema).default([]).optional(),
  reviews: z.array(communityGoalReviewSchema).default([]).optional(),
  selectServices: selectServicesSchema.optional(), // For wedding/event goals with service selection
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const communityGoalListResponseSchema = z.object({
  goals: z.array(communityGoalSchema),
  pagination: z
    .object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    })
    .optional(),
});

export const communityGoalDetailResponseSchema =
  communityGoalWithRelationsSchema;

// Group members list response - for UI group management
export const groupMembersResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    stats: groupStatsSchema,
    members: z.array(groupMemberSchema),
  }),
  message: z.string(),
});

// Invite friend response
export const inviteFriendResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    memberId: z.string(),
    message: z.string(),
  }),
  message: z.string(),
});

// Remove member response
export const removeMemberResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Send reminder response
export const sendReminderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ============================================================================
// INPUT SCHEMAS (for create/update operations)
// ============================================================================

export const createCommunityGoalInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().cuid('Valid category ID is required'),
  subCategoryId: z.string().cuid().optional().nullable(),
  agencyId: z.string().cuid('Valid agency ID is required'), // REQUIRED
  days: z.number().int().positive('Days must be a positive number'),
  nights: z.number().int().min(0, 'Nights must be zero or positive'),
  startDate: z.date().or(z.string()).optional(),
  endDate: z.date().or(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  bannerImageUrl: z.string().url().optional(),
  galleryImages: z.array(z.string().url()).default([]),
  maxParticipants: z.number().int().positive().optional(),
  minParticipants: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateCommunityGoalInputSchema =
  createCommunityGoalInputSchema.partial();

export const updateCommunityGoalStatusInputSchema = z.object({
  status: CommunityGoalStatusEnum,
  rejectionReason: z.string().optional(),
  internalNotes: z.string().optional(),
  adminTags: z.array(z.string()).optional(),
});

// Filter and query schemas
export const communityGoalFilterSchema = z.object({
  categoryId: z.string().cuid().optional(),
  subCategoryId: z.string().cuid().optional(),
  agencyId: z.string().cuid().optional(), // Filter by agency
  status: CommunityGoalStatusEnum.optional(),
  isFeatured: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  city: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.string().cuid().optional(),
  updatedBy: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Participation input schemas
export const createParticipationInputSchema = z.object({
  communityGoalId: z.string().cuid(),
  groupId: z.string().cuid().optional(),
});

export const updateParticipationInputSchema = z.object({
  status: ParticipationStatusEnum,
});

// Contribution input schema
export const createContributionInputSchema = z.object({
  participationId: z.string().cuid(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

// Review input schemas
export const createReviewInputSchema = z.object({
  communityGoalId: z.string().cuid(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

export const updateReviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

// Group input schemas
export const createGroupInputSchema = z.object({
  communityGoalId: z.string().cuid(),
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  maxMembers: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
});

export const updateGroupInputSchema = createGroupInputSchema
  .partial()
  .omit({ communityGoalId: true });

// Invitation input schemas
export const createInvitationInputSchema = z.object({
  communityGoalId: z.string().cuid(),
  groupId: z.string().cuid().optional(), // Optional - can create invitation before group
  inviteeId: z.string().cuid(),
  expiresAt: z.date().or(z.string()).optional(),
});

export const updateInvitationInputSchema = z.object({
  status: InvitationStatusEnum,
});

// UI-specific input schemas for group management
export const inviteFriendInputSchema = z.object({
  email: z.string().email('Valid email is required'),
  goalId: z.string(),
});

export const removeMemberInputSchema = z.object({
  memberId: z.string(),
  goalId: z.string(),
});

export const sendReminderInputSchema = z.object({
  memberId: z.string(),
  goalId: z.string(),
});

// ============================================================================
// TYPESCRIPT TYPES (inferred from schemas)
// ============================================================================

// Enum types
export type CommunityGoalStatus = z.infer<typeof CommunityGoalStatusEnum>;
export type CommunityGoalDateSelectionType = z.infer<
  typeof CommunityGoalDateSelectionTypeEnum
>;
export type ParticipationStatus = z.infer<typeof ParticipationStatusEnum>;
export type InvitationStatus = z.infer<typeof InvitationStatusEnum>;
export type ContributionStatus = z.infer<typeof ContributionStatusEnum>;
export type ReviewStatus = z.infer<typeof ReviewStatusEnum>;
export type GroupMemberStatus = z.infer<typeof GroupMemberStatusEnum>;

// Core entity types
export type Agency = z.infer<typeof agencySchema>;
export type Brand = z.infer<typeof brandSchema>;
export type CommunityGoal = z.infer<typeof communityGoalSchema>;
export type CommunityGoalWithRelations = z.infer<
  typeof communityGoalWithRelationsSchema
>;

// Related entity types
export type CommunityGoalCategory = z.infer<typeof communityGoalCategorySchema>;
export type CommunityGoalSubCategory = z.infer<
  typeof communityGoalSubCategorySchema
>;
export type CommunityGoalItinerary = z.infer<
  typeof communityGoalItinerarySchema
>;
export type CommunityGoalAvailableDate = z.infer<
  typeof communityGoalAvailableDateSchema
>;
export type CommunityGoalAvailableMonth = z.infer<
  typeof communityGoalAvailableMonthSchema
>;
export type CommunityGoalPackage = z.infer<typeof communityGoalPackageSchema>;
export type CommunityGoalService = z.infer<typeof communityGoalServiceSchema>;
export type CommunityGoalReview = z.infer<typeof communityGoalReviewSchema>;
export type CommunityGoalParticipation = z.infer<
  typeof communityGoalParticipationSchema
>;
export type CommunityGoalGroup = z.infer<typeof communityGoalGroupSchema>;
export type CommunityGoalInvitation = z.infer<
  typeof communityGoalInvitationSchema
>;
export type CommunityGoalContribution = z.infer<
  typeof communityGoalContributionSchema
>;

// UI-specific types
export type CommunityGroupMember = z.infer<typeof groupMemberSchema>;
export type CommunityGroupStats = z.infer<typeof groupStatsSchema>;
export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type ServiceSection = z.infer<typeof serviceSectionSchema>;
export type SelectServices = z.infer<typeof selectServicesSchema>;

// API Response types
export type CommunityGoalListResponse = z.infer<
  typeof communityGoalListResponseSchema
>;
export type CommunityGoalDetailResponse = z.infer<
  typeof communityGoalDetailResponseSchema
>;
export type CommunityGroupMembersResponse = z.infer<
  typeof groupMembersResponseSchema
>;
export type CommunityInviteFriendResponse = z.infer<
  typeof inviteFriendResponseSchema
>;
export type CommunityRemoveMemberResponse = z.infer<
  typeof removeMemberResponseSchema
>;
export type CommunitySendReminderResponse = z.infer<
  typeof sendReminderResponseSchema
>;

// Input types for API operations
export type CreateCommunityGoalInput = z.infer<
  typeof createCommunityGoalInputSchema
>;
export type UpdateCommunityGoalInput = z.infer<
  typeof updateCommunityGoalInputSchema
>;
export type UpdateCommunityGoalStatusInput = z.infer<
  typeof updateCommunityGoalStatusInputSchema
>;
export type CommunityGoalFilter = z.infer<typeof communityGoalFilterSchema>;

// Participation input types
export type CreateParticipationInput = z.infer<
  typeof createParticipationInputSchema
>;
export type UpdateParticipationInput = z.infer<
  typeof updateParticipationInputSchema
>;

// Contribution input types
export type CreateContributionInput = z.infer<
  typeof createContributionInputSchema
>;

// Review input types
export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewInputSchema>;

// Group input types
export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupInputSchema>;

// Invitation input types
export type CreateInvitationInput = z.infer<typeof createInvitationInputSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationInputSchema>;

// UI-specific input types
export type InviteFriendInput = z.infer<typeof inviteFriendInputSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberInputSchema>;
export type SendReminderInput = z.infer<typeof sendReminderInputSchema>;

// ============================================================================
// HELPER TYPES (for common use cases)
// ============================================================================

/**
 * Community Goal card data - minimal data for displaying in cards/lists
 */
export type CommunityGoalCard = Pick<
  CommunityGoal,
  | 'id'
  | 'name'
  | 'description'
  | 'categoryName'
  | 'days'
  | 'nights'
  | 'city'
  | 'bannerImageUrl'
  | 'maxParticipants'
  | 'isFeatured'
  | 'tags'
  | 'createdAt'
>;

/**
 * Community Goal with computed fields - includes calculated fields for UI display
 */
export type CommunityGoalWithComputedFields = CommunityGoal & {
  progressPercentage: number;
  daysRemaining: number | null;
  isFullyFunded: boolean;
  canJoin: boolean;
  participantsRemaining: number | null;
};

/**
 * Community Goal summary - for admin dashboards and analytics
 */
export type CommunityGoalSummary = {
  id: string;
  name: string;
  status: CommunityGoalStatus;
  participantsCount: number;
  createdAt: Date | string;
  createdBy: string | null;
};

/**
 * Participation with user details
 */
export type ParticipationWithUser = CommunityGoalParticipation & {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
};

/**
 * Review with user details
 */
export type ReviewWithUser = CommunityGoalReview & {
  user: {
    id: string;
    name: string;
    avatar?: string | null;
  };
};

/**
 * Group with members
 */
export type GroupWithMembers = CommunityGoalGroup & {
  members: ParticipationWithUser[];
  memberCount: number;
};

/**
 * Contribution with details
 */
export type ContributionWithDetails = CommunityGoalContribution & {
  participation: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string | null;
    };
  };
};

/**
 * Full Community Goal details - complete data structure for detail pages
 */
export type CommunityGoalFullDetails = CommunityGoalWithRelations & {
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  participationsWithUsers?: ParticipationWithUser[];
  reviewsWithUsers?: ReviewWithUser[];
  groupsWithMembers?: GroupWithMembers[];
  contributionsWithDetails?: ContributionWithDetails[];
};

// ============================================================================
// CONSTANTS (for UI - dropdowns, labels, colors)
// ============================================================================

export const COMMUNITY_GOAL_STATUSES: CommunityGoalStatus[] = [
  'DRAFT',
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED',
];

export const PARTICIPATION_STATUSES: ParticipationStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PAID',
  'CANCELLED',
  'REJECTED',
];

export const INVITATION_STATUSES: InvitationStatus[] = [
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
];

export const CONTRIBUTION_STATUSES: ContributionStatus[] = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
];

export const REVIEW_STATUSES: ReviewStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

export const GROUP_MEMBER_STATUSES: GroupMemberStatus[] = [
  'active',
  'pending',
  'declined',
];

// Status labels for UI display
export const COMMUNITY_GOAL_STATUS_LABELS: Record<CommunityGoalStatus, string> =
  {
    DRAFT: 'Draft',
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    ARCHIVED: 'Archived',
  };

export const GROUP_MEMBER_STATUS_LABELS: Record<GroupMemberStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  declined: 'Declined',
};

// Status colors for UI styling
export const COMMUNITY_GOAL_STATUS_COLORS: Record<CommunityGoalStatus, string> =
  {
    DRAFT: 'gray',
    OPEN: 'blue',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'green',
    CANCELLED: 'red',
    ARCHIVED: 'gray',
  };

export const GROUP_MEMBER_STATUS_COLORS: Record<GroupMemberStatus, string> = {
  active: 'green',
  pending: 'yellow',
  declined: 'red',
};
