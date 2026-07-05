import { create } from 'zustand';
import type { AccessibilityIssue, AiAuditProgress, AiFix, ScanResult } from '@/lib/types';
import type { QuotaStatus } from '@/lib/scan-limits';
import { summarizeIssues } from '@/lib/scan-summary';

type ScanStatus = 'idle' | 'scanning' | 'done' | 'error';
type AiAuditStatus = 'idle' | 'running' | 'done' | 'error';

/** Completion summary for the last deep scan. */
export interface AiAuditInfo {
  criteriaChecked: number;
  found: number;
  /** AI findings dropped after evidence/selector validation. */
  rejected: number;
}

interface PanelState {
  status: ScanStatus;
  result: ScanResult | null;
  error: string | null;
  quota: QuotaStatus | null;
  /** UI language, mirrored from Settings. */
  language: 'fr' | 'en';
  aiAuditStatus: AiAuditStatus;
  aiAuditProgress: AiAuditProgress | null;
  aiAuditError: string | null;
  aiAuditInfo: AiAuditInfo | null;
  fixes: Record<string, AiFix>;
  fixLoading: Record<string, boolean>;
  fixError: Record<string, string>;
  setStatus: (status: ScanStatus) => void;
  setResult: (result: ScanResult) => void;
  setError: (error: string | null) => void;
  setQuota: (quota: QuotaStatus) => void;
  setLanguage: (language: 'fr' | 'en') => void;
  setAiAuditStatus: (status: AiAuditStatus) => void;
  setAiAuditProgress: (progress: AiAuditProgress | null) => void;
  setAiAuditError: (error: string | null) => void;
  setAiAuditInfo: (info: AiAuditInfo | null) => void;
  mergeAiIssues: (issues: AccessibilityIssue[]) => void;
  setFix: (issueId: string, fix: AiFix) => void;
  setFixLoading: (issueId: string, loading: boolean) => void;
  setFixError: (issueId: string, error: string | null) => void;
}

function recomputeSummary(result: ScanResult): ScanResult {
  const allSeverities = [
    ...result.accessibilityIssues.map((i) => ({ severity: i.severity })),
    ...result.performanceIssues.map((i) => ({ severity: i.severity })),
  ];
  return { ...result, summary: summarizeIssues(allSeverities) };
}

export const usePanelStore = create<PanelState>((set) => ({
  status: 'idle',
  result: null,
  error: null,
  quota: null,
  language: 'fr',
  aiAuditStatus: 'idle',
  aiAuditProgress: null,
  aiAuditError: null,
  aiAuditInfo: null,
  fixes: {},
  fixLoading: {},
  fixError: {},
  setStatus: (status) => set({ status }),
  setResult: (result) =>
    set({
      result,
      status: 'done',
      error: null,
      aiAuditStatus: 'idle',
      aiAuditProgress: null,
      aiAuditError: null,
      aiAuditInfo: null,
    }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  setQuota: (quota) => set({ quota }),
  setLanguage: (language) => set({ language }),
  setAiAuditStatus: (aiAuditStatus) => set({ aiAuditStatus }),
  setAiAuditProgress: (aiAuditProgress) => set({ aiAuditProgress }),
  setAiAuditError: (aiAuditError) => set({ aiAuditError }),
  setAiAuditInfo: (aiAuditInfo) => set({ aiAuditInfo }),
  mergeAiIssues: (issues) =>
    set((state) => {
      if (!state.result || issues.length === 0) return state;
      const next = recomputeSummary({
        ...state.result,
        accessibilityIssues: [...state.result.accessibilityIssues, ...issues],
      });
      return { result: next };
    }),
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
    set((state) => {
      const fixError = { ...state.fixError };
      if (error === null) {
        delete fixError[issueId];
      } else {
        fixError[issueId] = error;
      }
      return {
        fixError,
        fixLoading: { ...state.fixLoading, [issueId]: false },
      };
    }),
}));
