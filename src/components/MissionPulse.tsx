"use client";

import { differenceInMinutes, format, isAfter, isBefore } from 'date-fns';
import { CalendarDays, Clock } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';
import { useIsClient } from '@/hooks/useIsClient';
import { useEffect, useState } from 'react';

export default function MissionPulse() {
  const mounted = useIsClient();
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const scheduledTasks = tasks
    .filter((task) => task.date === selectedDate && task.status === 'scheduled' && task.scheduledTime)
    .sort((a, b) => new Date(a.scheduledTime ?? 0).getTime() - new Date(b.scheduledTime ?? 0).getTime());

  const activeTask = scheduledTasks.find((task) => {
    const start = new Date(task.scheduledTime!);
    const end = new Date(start.getTime() + (task.duration ?? 30) * 60000);
    return isBefore(start, now) && isAfter(end, now);
  });

  const nextTask = scheduledTasks.find((task) => {
    return isAfter(new Date(task.scheduledTime!), now);
  });

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl p-4">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
        <Clock size={16} />
        Mission Pulse
      </h3>
      
      <div className="flex flex-1 flex-col gap-4">
        {activeTask ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Active Block
            </div>
            <div className="mt-2 text-sm font-semibold text-white">{activeTask.title}</div>
            <div className="mt-1 text-xs text-gray-400">
              Ends at {format(new Date(new Date(activeTask.scheduledTime!).getTime() + (activeTask.duration ?? 30) * 60000), 'h:mm a')}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-xs text-gray-500">
            No active block right now
          </div>
        )}

        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            <CalendarDays size={12} /> Next Up
          </div>
          {nextTask ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="font-mono text-xs text-amber-200">
                {format(new Date(nextTask.scheduledTime!), 'h:mm a')}
                <span className="ml-2 text-[10px] text-gray-400">
                  (in {differenceInMinutes(new Date(nextTask.scheduledTime!), now)} min)
                </span>
              </div>
              <div className="mt-1 truncate text-sm font-medium text-gray-200">{nextTask.title}</div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/5 p-3 text-center text-xs text-gray-500">
              Schedule clear
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
