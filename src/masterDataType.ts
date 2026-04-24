// Master data for Business Loan
import { z } from 'zod';
import { personalLoanTenures } from './masterData';

export const personalLoanTenureSchema = z
  .number()
  .refine(val => personalLoanTenures.includes(val), {
    message: `Loan tenure must be one of: ${personalLoanTenures.join(', ')}`,
  });

export type LoanConfig = {
  readonly interestRate: number;
  readonly minLoanAmount: number;
  readonly maxLoanAmount: number;
  readonly emiStartingFrom: number;
  readonly months: readonly number[]; // months array is also readonly
};

export type BusinessLoanMasterData = {
  readonly selfEmployed: LoanConfig;
  readonly selfEmployedProfessional: LoanConfig;
};

export interface DashboardLoanRate {
  minRate: number;
  maxRate: number;
}

import type { FundFilterMasterData } from './masterData/fundsFilter';

export interface MasterData {
  businessLoan: BusinessLoanMasterData;
  dashboard: {
    personalLoan: DashboardLoanRate;
    businessLoan: DashboardLoanRate;
    propertyLoan: DashboardLoanRate;
    usedCarLoan: DashboardLoanRate;
    emiCalculator: DashboardLoanRate;
  };
  fundFilter: FundFilterMasterData;
}
