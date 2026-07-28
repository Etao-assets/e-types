import { z } from 'zod';
import { mobileNumberSchema } from './mobile';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: mobileNumberSchema,
  // Optional influencer referral code. `.or(z.literal(''))` keeps the inferred
  // type a plain `string | undefined` so react-hook-form can start the input as
  // '' without a validation failure; the server trims, uppercases and validates.
  referralCode: z
    .string()
    .regex(
      /^[A-Za-z0-9]{4,12}$/,
      'Referral code must be 4-12 letters or digits',
    )
    .optional()
    .or(z.literal('')),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
