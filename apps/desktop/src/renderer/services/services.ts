import api from './api';
import type { Tender, TenderFilter, DashboardStats, Competitor, CompanyProfile, WinProbabilityResult, Notification, ApplicationDocument } from '../types';

export const tenderService = {
  getAll: (params?: TenderFilter) => api.get<Tender[]>('/tenders', { params }),
  getById: (id: string) => api.get<Tender>(`/tenders/${id}`),
  getRecommended: () => api.get<Tender[]>('/tenders/recommended'),
  getStats: () => api.get<DashboardStats>('/tenders/stats'),
};

export const competitorService = {
  getByBin: (bin: string) => api.get<Competitor>(`/competitors/${bin}`),
  getByCategory: (kpgz: string) => api.get<Competitor[]>('/competitors', { params: { kpgz } }),
  getHeatmap: () => api.get<Record<string, number>>('/competitors/heatmap'),
};

export const profileService = {
  get: () => api.get<CompanyProfile>('/profile'),
  update: (data: Partial<CompanyProfile>) => api.put<CompanyProfile>('/profile', data),
};

export const aiService = {
  getWinProbability: (tenderId: string) => api.get<WinProbabilityResult>(`/ai/probability/${tenderId}`),
  getScenarioAnalysis: (tenderId: string, priceAdjustment: number) =>
    api.get<WinProbabilityResult>(`/ai/scenario/${tenderId}`, { params: { priceAdjustment } }),
  getRecommendations: (tenderId: string) => api.get<{ recommendations: string[] }>(`/ai/recommendations/${tenderId}`),
};

export const documentService = {
  generate: (tenderId: string, type: string) => api.post<ApplicationDocument>(`/documents/generate`, { tenderId, type }),
  getAll: () => api.get<ApplicationDocument[]>('/documents'),
  getById: (id: string) => api.get<ApplicationDocument>(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'arraybuffer' }),
};

export const notificationService = {
  getAll: () => api.get<Notification[]>('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const analyticsService = {
  getHistory: (period?: string) => api.get('/analytics/history', { params: { period } }),
  getRoi: () => api.get('/analytics/roi'),
  getBenchmarks: () => api.get('/analytics/benchmarks'),
};

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; bin: string; name: string }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};
