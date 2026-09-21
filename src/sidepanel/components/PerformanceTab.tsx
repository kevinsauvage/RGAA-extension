import type { ScanResult } from '@/lib/types';
import { PerformanceSummaryCards } from './PerformanceSummaryCards';
import { PerformancePanel } from './PerformancePanel';

export function PerformanceTab({ result }: { result: ScanResult }) {
  return (
    <div className="space-y-3">
      <PerformanceSummaryCards result={result} />
      <PerformancePanel webVitals={result.webVitals} issues={result.performanceIssues} />
    </div>
  );
}
