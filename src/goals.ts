//schema

import { z } from 'zod';

// ✅ NEW: Amount object schema
export const AmountSchema = z.object({
  title: z.string(), // e.g., "Starting Price", "Session Price", "Base Package"
  description: z.string(), // e.g., "Per person package cost"
  value: z.number().positive(), // Actual price value
});

// ✅ NEW: Duration item schema (for array of duration items)
export const DurationItemSchema = z.object({
  title: z.string(), // e.g., "Days", "Nights", "Duration", "Event Day"
  value: z.number().positive(), // Duration value
  unit: z.string(), // e.g., "days", "nights", "hours", "day"
});

// ✅ KEEP: DurationType enum for backward compatibility
export const DurationTypeSchema = z.enum([
  'hours',
  'days',
  'weeks',
  'months',
  'day',
  'nights',
]);

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),

  // ✅ NEW: Amount as object
  amount: AmountSchema,

  // ✅ KEEP: Backward compatibility fields
  targetAmount: z.number().positive().optional(),
  startingAmount: z.number().positive().optional(),

  // ✅ NEW: Duration as array of objects
  duration: z.array(DurationItemSchema),

  location: z.string().nullable(),
  category: z.string().optional(), // for flat list structure
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  views: z.number().optional(),
});

// Service item schema for wedding goals
export const ServiceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
});

// Service section schema for wedding goals
export const ServiceSectionSchema = z.object({
  title: z.string(), // e.g., "SERVICES/PACKAGES", "ADDITIONAL SERVICES", "PERSONAL EVENTS"
  items: z.array(ServiceItemSchema),
});

// Select services schema (only for wedding goals)
export const SelectServicesSchema = z.object({
  sections: z.array(ServiceSectionSchema),
});

// Extended schema for goal details page
export const GoalDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),

  // ✅ NEW: Amount as object
  amount: AmountSchema,

  // ✅ KEEP: Backward compatibility fields
  targetAmount: z.number().positive().optional(),
  startingAmount: z.number().positive().optional(),

  // ✅ NEW: Duration as array of objects
  duration: z.array(DurationItemSchema),

  location: z.string().nullable(),
  category: z.string(),
  overview: z.string(),
  itinerary: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      description: z.string(),
    }),
  ),
  reviews: z.array(
    z.object({
      id: z.string(),
      userName: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string(),
      date: z.string(),
    }),
  ),
  views: z.number(),
  availableDates: z.array(
    z.object({
      date: z.string(), // ISO date string "YYYY-MM-DD"
      label: z.string(), // e.g., "Independence Day Special - Peak time"
      price: z.number().positive(),
      isAvailable: z.boolean(),
    }),
  ),
  selectServices: SelectServicesSchema.optional(), // Only present for wedding goals
});

export const GoalDetailsResponseSchema = z.object({
  success: z.boolean(),
  data: GoalDetailsSchema,
  message: z.string(),
});

// ✅ KEEP: Category-based structure for backward compatibility
export const GoalCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  goals: z.array(GoalSchema),
});

// ✅ KEEP: Category-based response for backward compatibility
export const GoalsResponseCategoryBasedSchema = z.object({
  success: z.boolean(),
  data: z.object({
    categories: z.array(GoalCategorySchema),
  }),
  message: z.string(),
});

// ✅ NEW: Flat list response with pagination
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const GoalsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    goals: z.array(GoalSchema),
    pagination: PaginationSchema,
  }),
  message: z.string(),
});

// Infer types from schemas
export type DurationType = z.infer<typeof DurationTypeSchema>;
export type DurationItem = z.infer<typeof DurationItemSchema>;
export type Amount = z.infer<typeof AmountSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type GoalCategory = z.infer<typeof GoalCategorySchema>;
export type GoalsResponse = z.infer<typeof GoalsResponseSchema>;
export type GoalsResponseCategoryBased = z.infer<
  typeof GoalsResponseCategoryBasedSchema
>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type GoalDetails = z.infer<typeof GoalDetailsSchema>;
export type GoalDetailsResponse = z.infer<typeof GoalDetailsResponseSchema>;

// Goal Actions Schema - for checkGoalActions function
export const GoalActionsSchema = z.object({
  delete: z.boolean().optional(),
  switchToIndividual: z.boolean().optional(),
  removeGroup: z.boolean().optional(),
});

export const GoalActionResultSchema = z.object({
  delete: z
    .object({
      canDelete: z.boolean(),
    })
    .optional(),
  switchToIndividual: z
    .object({
      canSwitch: z.boolean(),
    })
    .optional(),
  removeGroup: z
    .object({
      canRemove: z.boolean(),
    })
    .optional(),
});

// Infer types for goal actions
export type GoalActions = z.infer<typeof GoalActionsSchema>;
export type GoalActionResult = z.infer<typeof GoalActionResultSchema>;
