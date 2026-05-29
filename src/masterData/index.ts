import { LoanConfig } from '../masterDataType';
import { BusinessLoanMasterData } from '../masterDataType';

export const loanAmtLimitPersonal = Object.freeze({
  min: 50000, // 50k
  max: 7500000, // 75 lakh
});

export const loanAmtLimitSelfEmpBusiness = Object.freeze({
  min: 200000, // 2 lakh
  max: 7500000, // 75 lakh
});

export const loanAmtLimitSelfEmpPro = Object.freeze({
  min: 50000, // 50k
  max: 10000000, // 1 crore
});

export const personalLoanTenures = Object.freeze([12, 24, 36, 48, 60, 72, 84]);
export const businessLoanTenuresSelfEmpBusiness = Object.freeze([
  12, 24, 36, 48, 60, 72, 84,
]);
export const businessLoanTenuresSelfEmpPro = Object.freeze([
  12, 24, 36, 48, 60, 72, 84, 96,
]);

export const personalLoanMasterData: Readonly<LoanConfig> = Object.freeze({
  interestRate: 12,
  minLoanAmount: loanAmtLimitPersonal.min,
  maxLoanAmount: loanAmtLimitPersonal.max,
  emiStartingFrom: 1099,
  months: personalLoanTenures,
});

export const businessLoanMasterData: Readonly<BusinessLoanMasterData> =
  Object.freeze({
    selfEmployed: Object.freeze({
      interestRate: 13.99,
      minLoanAmount: loanAmtLimitSelfEmpBusiness.min,
      maxLoanAmount: loanAmtLimitSelfEmpBusiness.max,
      emiStartingFrom: 4653,
      months: businessLoanTenuresSelfEmpBusiness,
    }),
    selfEmployedProfessional: Object.freeze({
      interestRate: 10.5,
      minLoanAmount: loanAmtLimitSelfEmpPro.min,
      maxLoanAmount: loanAmtLimitSelfEmpPro.max,
      emiStartingFrom: 1075,
      months: businessLoanTenuresSelfEmpPro,
    }),
  });

export * from './fundCategoryCore';
export * from './fundsFilter';

export const dashboard = Object.freeze({
  personalLoan: { minRate: 10.5, maxRate: 24 },
  businessLoan: { minRate: 11, maxRate: 20 },
  propertyLoan: { minRate: 8.5, maxRate: 12 },
  usedCarLoan: { minRate: 9.5, maxRate: 16 },
  emiCalculator: { minRate: 8.5, maxRate: 12 },
});

export * from './marketCapCategory';
export * from './marketCaps'
export * from './fundRisk';
