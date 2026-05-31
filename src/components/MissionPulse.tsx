"use client";

import { useEffect, useState } from 'react';
import { differenceInMinutes, format, isAfter, isBefore } from 'date-fns';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useIsClient } from '@/hooks/useIsClient';

export default function MissionPulse() {
  const [now, setNow] = useState(new Date());
  const tasks = useTaskStore((state) => state.tasks);
  const mounted = useIsClient();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const scheduledTasks = tasks
    .filter((t) => t.status === 'scheduled' && t.scheduledTime)
    .sort((a, b) => new Date(a.scheduledTime!).getTime() - new Date(b.scheduledTime!).getTime());

  const activeTask = scheduledTasks.find((t) => {
    const start = new Date(t.scheduledTime!);
    const end = new Date(start.getTime() + (t.duration || 30) * 60000);
    return isBefore(start, now) && isAfter(end, now);
  });

  const nextTask = scheduledTasks.find((t) => isAfter(new Date(t.scheduledTime!), now));

  if (!activeTask && !nextTask) {
    return (
      <div className="glass-card flex min-h-[100px] flex-col items-center justify-center p-6 text-center animate-fade-in">
        <CheckCircle2 size={24} className="mb-2 text-emerald-500/50" />
        <h3 className="text-sm font-medium text-neutral-300">All clear</h3>
        <p className="mt-1 text-xs text-neutral-500">No upcoming blocks scheduled</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activeTask && (
        <div className="glass-card-strong relative overflow-hidden border-emerald-500/30 p-4 animate-fade-in glow-emerald">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Active Now
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/80">
              <Clock size={12} />
              Until {format(new Date(new Date(activeTask.scheduledTime!).getTime() + (activeTask.duration || 30) * 60000), 'h:mm a')}
            </span>
          </div>
          <p className="text-lg font-bold text-white truncate leading-tight">{activeTask.title}</p>
        </div>
      )}

      {nextTask && (
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              <CalendarDays size={12} /> Up Next
            </h3>
            <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              in {Math.max(0, differenceInMinutes(new Date(nextTask.scheduledTime!), now))}m
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-300 truncate">{nextTask.title}</p>
        </div>
      )}
    </div>
  );
}
