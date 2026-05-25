"use client";

import { differenceInCalendarDays, format } from 'date-fns';
import { CalendarDays, Target } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useIsClient } from '@/hooks/useIsClient';

const GOALS = [
  { title: 'GATE 2027', targetDate: '2027-02-01T00:00:00Z' },
  { title: 'Syllabus', targetDate: '2026-10-31T23:59:59', progress: 35 },
];

export default function MissionPulse() {
  const mounted = useIsClient();
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);

  if (!mounted) return null;

  const upcoming = tasks
    .filter((task) => task.date === selectedDate && task.status === 'scheduled' && task.scheduledTime)
    .sort((a, b) => new Date(a.scheduledTime ?? 0).getTime() - new Date(b.scheduledTime ?? 0).getTime())
    .slice(0, 2);

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl p-3">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        <section className="min-w-0">
          <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            <Target size={14} />
            Goals
          </h3>
          <div className="grid gap-2">
            {GOALS.map((goal) => {
              const targetDate = new Date(goal.targetDate);
              const days = differenceInCalendarDays(targetDate, new Date());
              return (
                <div key={goal.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-semibold text-gray-100">{goal.title}</span>
                    <span className="shrink-0 font-mono text-[11px] text-emerald-100">{days}d</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-gray-500">
                    <span>{format(targetDate, 'MMM d')}</span>
                    {goal.progress !== undefined && <span>{goal.progress}%</span>}
                  </div>
                  {goal.progress !== undefined && (
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/40">
                      <div className="h-full rounded-full bg-emerald-300" style={{ width: `${goal.progress}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="min-w-0">
          <h3 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            <CalendarDays size={14} />
            Next
          </h3>
          <div className="grid gap-2">
            {upcoming.length > 0 ? (
              upcoming.map((task) => (
                <div key={task.id} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-2">
                  <div className="font-mono text-[11px] text-amber-100">
                    {format(new Date(task.scheduledTime!), 'h:mm a')}
                  </div>
                  <div className="mt-1 truncate text-xs font-medium text-gray-100">{task.title}</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-3 text-center text-xs text-gray-500">
                No blocks
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
