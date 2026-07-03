import { create } from 'zustand';
import type { AiFix, ScanResult } from '@/lib/types';
import type { QuotaStatus } from '@/lib/scan-limits';

type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';

interface PanelState {
  status: ScanStatus;
  result: ScanResult | null;
  error: string | null;
  quota: QuotaStatus | null;
  fixes: Record<string, AiFix>;
  fixLoading: Record<string, boolean>;
  fixError: Record<string, string>;
  setStatus: (status: ScanStatus) => void;
  setResult: (result: ScanResult) => void;
  setError: (error: string | null) => void;
  setQuota: (quota: QuotaStatus) => void;
  setFix: (issueId: string, fix: AiFix) => void;
  setFixLoading: (issueId: string, loading: boolean) => void;
  setFixError: (issueId: string, error: string) => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  status: 'idle',
  result: null,
  error: null,
  quota: null,
  fixes: {},
  fixLoading: {},
  fixError: {},
  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, status: 'done', error: null }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  setQuota: (quota) => set({ quota }),
  setFix: (issueId, fix) =>
    set((state) => ({
      fixes: { ...state.fixes, [issueId]: fix },
      fixLoading: { ...state.fixLoading, [issueId]: false },
    })),
  setFixLoading: (issueId, loading) =>
    set((state) => ({
      fixLoading: { ...state.fixLoading, [issueId]: loading },
    })),
  setFixError: (issueId, error) =>
    set((state) => ({
      fixError: { ...state.fixError, [issueId]: error },
      fixLoading: { ...state.fixLoading, [issueId]: false },
    })),
}));
