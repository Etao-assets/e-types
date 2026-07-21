/**
 * User Profile and Financial Data Schemas
 */

import { z } from 'zod';
import {
  UCCAccountType,
  UCCClientType,
  UCCCommunicationMode,
  UCCDividendPaymode,
  UCCGender,
  UCCHoldingNature,
  UCCKYCType,
  UCCOccupation,
  UCCPaperlessFlag,
  UCCTaxStatus,
  UCCYesNoFlag,
} from './bse';
import { panSchema } from './pan';
import { ifscCodeSchema } from './ifsc';
import { DateObjOrString } from './date';
import {
  NomineeIdentityType,
  NomineeMinorFlag,
  NomineeRelationship,
} from './bse/enums/nomination';
import { StateCode } from './bse/enums/stateCode';
import { CountryCode, CountryCodeName } from './bse/enums/countryCode';

// User KYC Profile Schema (for mutual fund registration)
export const UserKYCProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),

  // Personal / KYC fields
  email: z.string().email().optional(),
  primaryHolderFirstName: z.string().min(1).max(70),
  primaryHolderMiddleName: z.string().max(70).optional(),
  primaryHolderLastName: z.string().max(70).optional(),
  taxStatus: z.nativeEnum(UCCTaxStatus),
  primaryHolderDob: z.date().optional(),
  gender: z.nativeEnum(UCCGender),
  occupationCode: z.nativeEnum(UCCOccupation),
  primaryHolderPANExempt: z.nativeEnum(UCCYesNoFlag),
  primaryHolderKYCType: z.nativeEnum(UCCKYCType),

  primaryHolderPANEncrypted: panSchema,
  primaryHolderPANLast4: z.string().length(4),

  // Address / contact
  address1: z.string().min(1).max(40),
  address2: z.string().max(40).optional(),
  address3: z.string().max(40).optional(),
  city: z.string().min(1).max(35),
  state: z.nativeEnum(StateCode),
  pincode: z.string().length(6),
  country: z.nativeEnum(CountryCodeName),
  communicationMode: z.nativeEnum(UCCCommunicationMode),

  createdAt: DateObjOrString,
  updatedAt: DateObjOrString,
});

export type UserKYCProfile = z.infer<typeof UserKYCProfileSchema>;

// Create User Profile Schema (for API requests)
export const CreateUserKYCProfileSchema = UserKYCProfileSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  primaryHolderDob: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
});

export type CreateUserKYCProfileData = z.infer<
  typeof CreateUserKYCProfileSchema
>;

// Update User Profile Schema (all fields optional except required ones)
export const UpdateUserKYCProfileSchema = CreateUserKYCProfileSchema.partial();

export type UpdateUserKYCProfileData = z.infer<
  typeof UpdateUserKYCProfileSchema
>;

// Bank Account Schema
export const BankAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),

  // Banking fields
  accountType: z.nativeEnum(UCCAccountType),
  accountNoEncrypted: z.string().optional(),
  accountNoLast4: z.string().max(4).optional(),
  ifscCode: ifscCodeSchema,
  bankName: z.string().min(1),
  branchName: z.string().min(1),
  defaultBankFlag: z.nativeEnum(UCCYesNoFlag),

  createdAt: DateObjOrString,
  updatedAt: DateObjOrString,
});

export type BankAccount = z.infer<typeof BankAccountSchema>;

// Create Bank Account Schema (for API requests)
export const CreateBankAccountSchema = BankAccountSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBankAccountData = z.infer<typeof CreateBankAccountSchema>;

// Nominee Schema
export const NomineeSchema = z.object({
  id: z.string(),
  userId: z.string(),

  // Nominee details
  name: z.string().min(1),
  relationship: z.nativeEnum(NomineeRelationship),
  applicable: z.string().optional(),
  minorFlag: z.nativeEnum(NomineeMinorFlag),
  dob: DateObjOrString,
  guardian: z.string().optional(),
  identityType: z.nativeEnum(NomineeIdentityType),
  idNoEncrypted: z.string().optional(),
  email: z.string().email().optional(),
  mobile: z.string().optional(),
  add1: z.string().optional(),
  add2: z.string().optional(),
  add3: z.string().optional(),
  city: z.string().optional(),
  pin: z.string().optional(),
  country: z.string().optional(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Nominee = z.infer<typeof NomineeSchema>;

// Create Nominee Schema (for API requests)
export const CreateNomineeSchema = NomineeSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dob: z
    .string()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
});

export type CreateNomineeData = z.infer<typeof CreateNomineeSchema>;

// UCC Registration Schema
export const UccRegistrationSchema = z.object({
  id: z.string(),
  userId: z.string(),

  // UCC / registration specific
  clientCode: z.string().max(10),
  holdingNature: z.nativeEnum(UCCHoldingNature),
  clientType: z.nativeEnum(UCCClientType),
  divPayMode: z.nativeEnum(UCCDividendPaymode),
  paperlessFlag: z.nativeEnum(UCCPaperlessFlag),
  chequeName: z.string().optional(),

  createdAt: DateObjOrString,
  updatedAt: DateObjOrString,
});

export type UccRegistration = z.infer<typeof UccRegistrationSchema>;

// Create UCC Registration Schema (for API requests)
export const CreateUccRegistrationSchema = UccRegistrationSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUccRegistrationData = z.infer<
  typeof CreateUccRegistrationSchema
>;

// Update UCC Registration Schema (all fields optional)
export const UpdateUccRegistrationSchema =
  CreateUccRegistrationSchema.partial();

export type UpdateUccRegistrationData = z.infer<
  typeof UpdateUccRegistrationSchema
>;

// Combined Update User Data Schema
export const UpdateUserDataSchema = z.object({
  userProfile: UpdateUserKYCProfileSchema.optional(),
  // bankAccounts: z.array(CreateBankAccountSchema).optional(),
  // nominees: z.array(CreateNomineeSchema).optional(),
  // uccRegistration: UpdateUccRegistrationSchema.optional(),
});

export type UpdateUserData = z.infer<typeof UpdateUserDataSchema>;

// User with Profile Schema (for GET responses)
export const UserWithProfileSchema = z.object({
  id: z.string(),
  mobile: z.string(),
  email: z.string().optional(),
  name: z.string(),
  role: z.string(),
  isActive: z.boolean(),
  isPhoneVerified: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  profilePictureUrl: z.string().optional(),

  userProfile: UserKYCProfileSchema.optional(),
  bankAccounts: z.array(BankAccountSchema).optional(),
  nominees: z.array(NomineeSchema).optional(),
  uccRegistration: UccRegistrationSchema.optional(),
});

export type UserWithProfile = z.infer<typeof UserWithProfileSchema>;

// Profile Completeness Check Schema
export const ProfileCompletenessSchema = z.object({
  isComplete: z.boolean(),
  userId: z.string(),
  missingFields: z.array(z.string()).optional(),
});

export type ProfileCompleteness = z.infer<typeof ProfileCompletenessSchema>;
