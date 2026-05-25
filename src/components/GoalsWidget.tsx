"use client";

import { differenceInCalendarDays, format } from 'date-fns';
import { Target } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';

interface Goal {
  id: string;
  title: string;
  targetDate: string; // ISO
  totalValue?: number;
  currentValue?: number;
}

const DEFAULT_GOALS: Goal[] = [
  {
    id: '1',
    title: 'GATE 2027',
    targetDate: '2027-02-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Syllabus Tracker',
    targetDate: '2026-10-31T23:59:59',
    totalValue: 100,
    currentValue: 35,
  }
];

export default function GoalsWidget() {
  const mounted = useIsClient();

  if (!mounted) return null;

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl p-3">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
        <Target size={16} /> Long-Term Goals
      </h3>
      <div className="grid min-h-0 gap-2">
        {DEFAULT_GOALS.map(goal => {
          const targetDate = new Date(goal.targetDate);
          const daysLeft = differenceInCalendarDays(targetDate, new Date());
          const hasProgress = goal.totalValue !== undefined && goal.currentValue !== undefined;
          const progressPercent = hasProgress ? (goal.currentValue! / goal.totalValue!) * 100 : null;

          return (
            <div key={goal.id} className="flex min-w-0 flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-gray-100">{goal.title}</span>
                <span className="shrink-0 font-mono text-xs text-emerald-100">{daysLeft}d</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
                <span>{format(targetDate, 'MMM d, yyyy')}</span>
                {hasProgress && <span>{goal.currentValue}/{goal.totalValue}</span>}
              </div>
              {hasProgress && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                  <div 
                    className="h-full rounded-full bg-emerald-300" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
