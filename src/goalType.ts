export enum InvestmentGoalType {
  EDUCATION = 'EDUCATION',
  HOME = 'HOME',
  MARRIAGE = 'MARRIAGE',
  HEALTH = 'HEALTH',
  TRAVEL = 'TRAVEL',
  VEHICLE = 'VEHICLE',
  CAREER = 'CAREER',
  RETIREMENT = 'RETIREMENT',
  GADGET = 'GADGET',
  EMERGENCY_FUND = 'EMERGENCY_FUND',
  START_BUSINESS = 'START_BUSINESS',
  OTHER = 'OTHER',
}

export type InvestmentGoalDetail = {
  id: string;
  shortDesc: string;
  longDesc: string;
  label: string;
  position: number;
};

export const InvestmentGoalDetails: Record<
  InvestmentGoalType,
  InvestmentGoalDetail
> = {
  [InvestmentGoalType.EDUCATION]: {
    id: 'EDUCATION',
    shortDesc: 'Plan for quality education',
    longDesc: 'Plan for quality education',
    label: 'Education',
    position: 1,
  },
  [InvestmentGoalType.HOME]: {
    id: 'HOME',
    shortDesc: 'Buy your dream home',
    longDesc: 'Buy your dream home',
    label: 'Home',
    position: 2,
  },
  [InvestmentGoalType.MARRIAGE]: {
    id: 'MARRIAGE',
    shortDesc: 'Perfect wedding planning',
    longDesc: 'Perfect wedding planning',
    label: 'Marriage',
    position: 3,
  },
  [InvestmentGoalType.HEALTH]: {
    id: 'HEALTH',
    shortDesc: 'Health care & wellness',
    longDesc: 'Health care & wellness',
    label: 'Health',
    position: 4,
  },
  [InvestmentGoalType.TRAVEL]: {
    id: 'TRAVEL',
    shortDesc: 'Explore the world',
    longDesc: 'Explore the world',
    label: 'Travel',
    position: 5,
  },
  [InvestmentGoalType.VEHICLE]: {
    id: 'VEHICLE',
    shortDesc: 'Get your dream car',
    longDesc: 'Get your dream car',
    label: 'Vehicle',
    position: 6,
  },
  [InvestmentGoalType.CAREER]: {
    id: 'CAREER',
    shortDesc: 'Professional development',
    longDesc: 'Professional development',
    label: 'Career',
    position: 7,
  },
  [InvestmentGoalType.RETIREMENT]: {
    id: 'RETIREMENT',
    shortDesc: 'Secure Retirement',
    longDesc: 'Secure Retirement',
    label: 'Retirement',
    position: 8,
  },
  [InvestmentGoalType.GADGET]: {
    id: 'GADGET',
    shortDesc: 'Latest Technology',
    longDesc: 'Latest Technology',
    label: 'Gadget',
    position: 9,
  },
  [InvestmentGoalType.EMERGENCY_FUND]: {
    id: 'EMERGENCY_FUND',
    shortDesc: 'Financial safety net',
    longDesc: 'Financial safety net',
    label: 'Emergency Fund',
    position: 10,
  },
  [InvestmentGoalType.START_BUSINESS]: {
    id: 'START_BUSINESS',
    shortDesc: 'Entrepreneurial dreams',
    longDesc: 'Entrepreneurial dreams',
    label: 'Start Business',
    position: 11,
  },
  [InvestmentGoalType.OTHER]: {
    id: 'OTHER',
    shortDesc: 'Custom investment goal',
    longDesc: 'Custom investment goal',
    label: 'Other',
    position: 12,
  },
};

export enum InvestmentGoalTypeExtra {
  CUSTOM_GROUP = 'c',
  COMMUNITY_GOAL = 'g',
}

export const InvestmentGoalOptions = [
  { label: 'Education', value: InvestmentGoalType.EDUCATION },
  { label: 'Home', value: InvestmentGoalType.HOME },
  { label: 'Marriage', value: InvestmentGoalType.MARRIAGE },
  { label: 'Health', value: InvestmentGoalType.HEALTH },
  { label: 'Travel', value: InvestmentGoalType.TRAVEL },
  { label: 'Vehicle', value: InvestmentGoalType.VEHICLE },
  { label: 'Career', value: InvestmentGoalType.CAREER },
  { label: 'Retirement', value: InvestmentGoalType.RETIREMENT },
  { label: 'Gadget', value: InvestmentGoalType.GADGET },
  { label: 'Emergency Fund', value: InvestmentGoalType.EMERGENCY_FUND },
  { label: 'Start Business', value: InvestmentGoalType.START_BUSINESS },
  { label: 'Other', value: InvestmentGoalType.OTHER },
];
