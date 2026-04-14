import { create } from 'zustand';
import type { Tender, TenderFilter, DashboardStats, Notification, CompanyProfile } from '../types';
import { tenderService, profileService, notificationService } from '../services/services';

interface AppStore {
  tenders: Tender[];
  tenderFilter: TenderFilter;
  stats: DashboardStats | null;
  profile: CompanyProfile | null;
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  setTenderFilter: (filter: Partial<TenderFilter>) => void;
  fetchTenders: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  tenders: [],
  tenderFilter: {},
  stats: null,
  profile: null,
  notifications: [],
  loading: false,
  error: null,

  setTenderFilter: (filter) =>
    set((state) => ({ tenderFilter: { ...state.tenderFilter, ...filter } })),

  fetchTenders: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await tenderService.getAll(get().tenderFilter);
      set({ tenders: data, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка загрузки тендеров';
      set({ error: msg, loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await tenderService.getStats();
      set({ stats: data });
    } catch {
      // silent
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await profileService.get();
      set({ profile: data });
    } catch {
      // silent
    }
  },

  fetchNotifications: async () => {
    try {
      const { data } = await notificationService.getAll();
      set({ notifications: data });
    } catch {
      // silent
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      await notificationService.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      }));
    } catch {
      // silent
    }
  },
}));
