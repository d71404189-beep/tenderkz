export interface Tender {
  id: string;
  externalId: string;
  title: string;
  description: string;
  customerName: string;
  customerBin: string;
  categoryKpgz: string;
  categoryKtru: string;
  region: string;
  amount: number;
  currency: string;
  type: TenderType;
  status: TenderStatus;
  publishedAt: string;
  deadlineAt: string;
  openingAt: string;
  guaranteeAmount: number;
  requirements: string;
  documents: TenderDocument[];
  winProbability?: number;
  competitorCount?: number;
}

export type TenderType =
  | 'ONE_STAGE'
  | 'TWO_STAGE'
  | 'PRICE_OFFER'
  | 'PRICE_QUOTATION'
  | 'SINGLE_SOURCE';

export type TenderStatus =
  | 'PUBLISHED'
  | 'CLARIFICATION'
  | 'RECEIVING'
  | 'OPENING'
  | 'EVALUATION'
  | 'AWARDED'
  | 'CANCELLED'
  | 'FAILED';

export interface TenderDocument {
  name: string;
  url: string;
  size: number;
}

export interface Competitor {
  bin: string;
  name: string;
  region: string;
  totalParticipated: number;
  totalWon: number;
  winRate: number;
  avgDiscount: number;
  categories: string[];
}

export interface CompanyProfile {
  id: string;
  bin: string;
  name: string;
  directorName: string;
  region: string;
  oked: string;
  categories: string[];
  licenses: License[];
  certificates: Certificate[];
  experience: ExperienceEntry[];
}

export interface License {
  type: string;
  number: string;
  validTo: string;
}

export interface Certificate {
  type: string;
  number: string;
  validTo: string;
}

export interface ExperienceEntry {
  tenderId: string;
  title: string;
  customerName: string;
  amount: number;
  year: number;
  categoryKpgz: string;
}

export interface TenderFilter {
  search?: string;
  region?: string[];
  amountMin?: number;
  amountMax?: number;
  type?: TenderType[];
  status?: TenderStatus[];
  categoryKpgz?: string[];
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface WinProbabilityResult {
  probability: number;
  factors: ProbabilityFactor[];
  recommendation: string;
  scenarioAnalysis: ScenarioResult[];
}

export interface ProbabilityFactor {
  name: string;
  value: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

export interface ScenarioResult {
  label: string;
  adjustedProbability: number;
  description: string;
}

export interface Notification {
  id: string;
  type: 'DEADLINE_72H' | 'DEADLINE_24H' | 'DEADLINE_3H' | 'OPENING' | 'RESULT' | 'CHANGE';
  title: string;
  message: string;
  tenderId: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  activeTenders: number;
  submittedApplications: number;
  wonTenders: number;
  winRate: number;
  totalRevenue: number;
  avgDiscount: number;
  upcomingDeadlines: Notification[];
  recommendedTenders: Tender[];
}

export interface ApplicationDocument {
  id: string;
  tenderId: string;
  type: string;
  status: 'draft' | 'ready' | 'signed' | 'submitted';
  createdAt: string;
  updatedAt: string;
  readinessScore: number;
}
