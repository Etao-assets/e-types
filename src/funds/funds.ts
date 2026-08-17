import { z } from 'zod';
import { DateObjOrString } from '../date';
import { amcSchema } from '../amc';
import { fundCategorySchema } from '../fundCategory';
import { fundReturnLatestSchema } from '../fundReturnLatest';
import { fundsRatingsSchema } from '../fundsRatings';
import { fundExpenseSchema } from '../fundExpense';
import { navSchema } from '../nav';
import { fundAumSchema } from '../fundAum';
import { holdingsSecurityLatestSchema } from '../holdingsSecurityLatest';
import { fundHoldingsSicSectorwiseImputedLatestSchema } from '../fundHoldingsSicSectorwiseImputedLatest';
import { fundManagerLatestSchema } from '../fundManagerLatest';
import { statsVariablesSchema } from '../statsVariables';
import { fundStyleboxSchema } from '../fundStylebox';
import { colourCodeSchema } from '../colourCode';
import { compositionSchema } from '../composition';
import { rtaCodesSchema } from '../rtaCodes';
import { fundEventsSchema } from '../fundEvents';
import { FundFilter, FundSortBy } from './filter';
import { PaginationParams } from '../api';

export const fundsSchema = z.object({
  plan_id: z.string(),
  basic_name: z.string(),
  short_name: z.string(),
  plan_name: z.string(),
  basic_short_name: z.string(),
  scheme_name: z.string(),
  amc_id: z.string(),
  category_id: z.string(),
  type_id: z.string(),
  face_value: z.number().nullable().optional(),
  min_initial_investment: z.number().nullable().optional(),
  min_subsequent_investment: z.number().nullable().optional(),
  min_withdrawl_amount: z.number().nullable().optional(),
  sip: z.boolean(),
  min_subsequent_sip_investment: z.number().nullable().optional(),
  sip_note: z.string().nullable().optional(),
  swp: z.boolean(),
  stp: z.boolean(),
  issue_open: z.string().nullable().optional(),
  issue_stated_close: z.string().nullable().optional(),
  issue_actual_close: z.string().nullable().optional(),
  allottment_date: z.string().nullable().optional(),
  late_redemption: z.string().nullable().optional(),
  resale_start_date: z.string().nullable().optional(),
  transfer_agent: z.string().nullable().optional(),
  transfer_agent_short_name: z.string().nullable().optional(),
  transfer_agent_email: z.string().nullable().optional(),
  amfi_code: z.string().nullable().optional(),
  min_balance: z.number().nullable().optional(),
  objective_text: z.string().nullable().optional(),
  benchmark: z.string().nullable().optional(),
  dividend_periodicity: z.string().nullable().optional(),
  minor_investments_allowed: z.boolean().nullable().optional(),
  is_retirement_fund: z.boolean().nullable().optional(),
  is_interval_fund: z.boolean().nullable().optional(),
  comm_max: z.number().nullable().optional(),
  min_swp_widw: z.number().nullable().optional(),
  redemption_note: z.string().nullable().optional(),
  equity_max: z.number().nullable().optional(),
  equity_min: z.number().nullable().optional(),
  debt_max: z.number().nullable().optional(),
  debt_min: z.number().nullable().optional(),
  money_mkt_max: z.number().nullable().optional(),
  money_mkt_min: z.number().nullable().optional(),
  colour: z.string().nullable().optional(),
  isin_code: z.string().nullable().optional(),
  modified_ts: DateObjOrString.nullable().optional(),
  is_dividend: z.boolean().nullable().optional(),
  auditor_code: z.string().nullable().optional(),
  custodian_code: z.string().nullable().optional(),
  is_direct_plan: z.boolean().nullable().optional(),
  reg_plan_id: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  new_fund: z.boolean().nullable().optional(),
  comm_min: z.number().nullable().optional(),
  is_etf_fund: z.boolean().nullable().optional(),
  lock_in: z.boolean().nullable().optional(),
  lock_in_period_days: z.string().nullable().optional(),
  variant: z.boolean().nullable().optional(),
  variant_fund_id: z.string().nullable().optional(),
  is_rgess_plan: z.boolean().nullable().optional(),
  min_widw_unit: z.number().nullable().optional(),
  min_subsequent_investment_unit: z.number().nullable().optional(),
  min_investment_multiples: z.number().nullable().optional(),
  transaction_status: z.string().nullable().optional(),
  stated_annual_expense: z.number().nullable().optional(),
  max_inv_amount: z.number().nullable().optional(),
  is_fof: z.boolean().nullable().optional(),
  last_etf_trade_date: DateObjOrString.nullable().optional(),
  is_index_fund: z.boolean().nullable().optional(),
  min_withdrawal_multiple_amount: z.number().nullable().optional(),
  interest_risk_name: z.string().nullable().optional(),
  credit_risk_name: z.string().nullable().optional(),
  potential_risk_class: z.string().nullable().optional(),
  fund_name: z.string().nullable().optional(),
  equity_derivatives_min: z.number().nullable().optional(),
  equity_derivatives_max: z.number().nullable().optional(),
  reit_invit_min: z.number().nullable().optional(),
  reit_invit_max: z.number().nullable().optional(),
  fund_objective_description: z.string().nullable().optional(),
  fund_id: z.string().nullable().optional(),
  instant_redemption_facility: z.boolean().nullable().optional(),
  nsdl_code: z.string().nullable().optional(),
  createdAt: DateObjOrString,
  updatedAt: DateObjOrString,
  amc: amcSchema.optional(),
  marketCapCategory: fundCategorySchema.optional(),
  // related/nested entities
  navRecords: z.array(navSchema).nullable().optional(),
  fundReturns: fundReturnLatestSchema.nullable().optional(),
  fundRatings: fundsRatingsSchema.nullable().optional(),
  fundExpenses: z.array(fundExpenseSchema).nullable().optional(),
  colourCode: colourCodeSchema.nullable().optional(),
  fundAum: z.array(fundAumSchema).nullable().optional(),
  holdingsSecurityLatest: z
    .array(holdingsSecurityLatestSchema)
    .nullable()
    .optional(),
  fundHoldingsSicSectorwise: z
    .array(fundHoldingsSicSectorwiseImputedLatestSchema)
    .nullable()
    .optional(),
  fundManagerLatest: z.array(fundManagerLatestSchema).nullable().optional(),
  statsVariables: statsVariablesSchema.nullable().optional(),
  fundStylebox: z.array(fundStyleboxSchema).nullable().optional(),
  composition: z.array(compositionSchema).nullable().optional(),
  rtaCodes: z.array(rtaCodesSchema).nullable().optional(),
  fundEvents: z.array(fundEventsSchema).nullable().optional(),
  amcLogo: z.string().nullable().optional(),
});

export const NewFundsSchema = fundsSchema.omit({
  plan_id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateFundsSchema = fundsSchema
  .omit({ plan_id: true, createdAt: true, updatedAt: true })
  .partial();

export const fundInfoSchema = z.object({
  plan_id: z.string(),
  scheme_name: z.string(),
  min_subsequent_sip_investment: z.number().nullable().optional(),
  min_initial_investment: z.number().nullable().optional(),
  min_investment_multiples: z.number().nullable().optional(),
  min_subsequent_investment_unit: z.number().nullable().optional(),
  issue_open: z.string().nullable().optional(),
  sip_allowed: z.boolean().nullable().optional(),
  lumpsum_allowed: z.boolean().nullable().optional(),
  // Whether BSE will actually accept a monthly SIP for this fund. Prefer this
  // over sip_allowed, which is a legacy column that is true for every fund.
  canCreateSip: z.boolean().nullable().optional(),
  // Minimum monthly instalment BSE accepts. Null when unknown — render no
  // minimum rather than zero.
  minSipAmount: z.number().nullable().optional(),
  sipUnavailableReason: z
    .enum([
      'FUND_NOT_ACTIVE',
      'SIP_NOT_SUPPORTED',
      'SCHEME_NOT_MAPPED',
      'SIP_CLOSED_AT_BSE',
    ])
    .nullable()
    .optional(),
  // Whether BSE will accept a one-time purchase. Prefer this over
  // lumpsum_allowed, which is a legacy column that is true for every fund.
  canInvestLumpsum: z.boolean().nullable().optional(),
  // Minimum one-time amount BSE accepts. Null when unknown — render no minimum
  // rather than zero.
  minLumpsumAmount: z.number().nullable().optional(),
  lumpsumUnavailableReason: z
    .enum(['FUND_NOT_ACTIVE', 'SCHEME_NOT_MAPPED', 'PURCHASE_CLOSED_AT_BSE'])
    .nullable()
    .optional(),
  amc: z
    .object({
      amc_short_name: z.string(),
      amc_full_name: z.string(),
    })
    .nullable()
    .optional(),
  marketCapCategory: z
    .object({
      category_name: z.string(),
      primary_category_name: z.string(),
    })
    .nullable()
    .optional(),
  colourCode: z
    .object({
      risk: z.string(),
    })
    .nullable()
    .optional(),
  fundRatings: z
    .object({
      fund_rating: z.number(),
    })
    .nullable()
    .optional(),
  fundReturns: z
    .object({
      ret_1day: z.number().nullable().optional(),
      ret_1year: z.number().nullable().optional(),
      ret_2year: z.number().nullable().optional(),
      ret_3year: z.number().nullable().optional(),
      ret_4year: z.number().nullable().optional(),
      ret_5year: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  navRecords: z
    .object({
      nav: z.number(),
      nav_date: DateObjOrString,
    })
    .nullable()
    .optional(),
  fundExpenses: z
    .object({
      expense_ratio: z.number(),
      as_on_date: DateObjOrString,
    })
    .nullable()
    .optional(),
  fundAum: z
    .object({
      aum: z.number(),
      as_on_date: DateObjOrString,
    })
    .nullable()
    .optional(),
  fundManagers: z.array(
    z.object({
      name: z.string().nullable().optional(),
      education: z.string().nullable().optional(),
      person_type: z.string().nullable().optional(),
      date_from: DateObjOrString.nullable().optional(),
    }),
  ),
  amcLogo: z.string().nullable().optional(),
});

export const fundPerformanceSchema = z.object({
  plan_id: z.string(),
  navHistory: z.array(
    z.object({
      nav: z.number(),
      nav_date: DateObjOrString,
    }),
  ),
  fundReturns: z
    .object({
      ret_1year: z.number().nullable().optional(),
      ret_2year: z.number().nullable().optional(),
      ret_3year: z.number().nullable().optional(),
      ret_4year: z.number().nullable().optional(),
      ret_5year: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type Funds = z.infer<typeof fundsSchema>;
export type NewFunds = z.infer<typeof NewFundsSchema>;
export type UpdateFunds = z.infer<typeof UpdateFundsSchema>;
export type FundInfoApiResponse = z.infer<typeof fundInfoSchema>;
export type FundPerformanceApiResponse = z.infer<typeof fundPerformanceSchema>;

export type FundListQueryParams = PaginationParams<FundFilter, FundSortBy>;
