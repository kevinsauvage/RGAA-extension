import type { ScanResult } from '@/lib/types';
import { ScoreRing } from './ScoreRing';

const CELLS = [
  { key: 'critical', label: 'Critical', className: 'text-red-600' },
  { key: 'serious', label: 'Serious', className: 'text-orange-600' },
  { key: 'moderate', label: 'Moderate', className: 'text-amber-600' },
  { key: 'minor', label: 'Minor', className: 'text-lime-600' },
] as const;

export function SummaryCards({ result }: { result: ScanResult }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <ScoreRing score={result.summary.score} />
      <div className="grid flex-1 grid-cols-2 gap-2">
        {CELLS.map((cell) => (
          <div
            key={cell.key}
            className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60"
          >
            <div className={`text-xl font-bold ${cell.className}`}>
              {result.summary[cell.key]}
            </div>
            <div className="text-xs text-slate-500">{cell.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
