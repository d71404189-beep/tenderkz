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
  type: string;
  status: string;
  publishedAt: string;
  deadlineAt: string;
  openingAt: string;
  guaranteeAmount: number;
  requirements: string;
  competitorCount: number;
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
  licenses: Array<{ type: string; number: string; validTo: string }>;
  certificates: Array<{ type: string; number: string; validTo: string }>;
  experience: Array<{
    tenderId: string;
    title: string;
    customerName: string;
    amount: number;
    year: number;
    categoryKpgz: string;
  }>;
}

export interface WinProbabilityResult {
  probability: number;
  factors: Array<{ name: string; value: string; impact: string; weight: number }>;
  recommendation: string;
  scenarioAnalysis: Array<{ label: string; adjustedProbability: number; description: string }>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  tenderId: string;
  read: boolean;
  createdAt: string;
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

export interface TenderFilter {
  search?: string;
  region?: string[];
  amountMin?: number;
  amountMax?: number;
  type?: string[];
  status?: string[];
  categoryKpgz?: string[];
  deadlineFrom?: string;
  deadlineTo?: string;
}
