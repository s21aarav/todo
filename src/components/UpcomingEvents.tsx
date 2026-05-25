"use client";

import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

export default function UpcomingEvents() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const upcoming = tasks
    .filter((task) => task.date === selectedDate && task.status === 'scheduled' && task.scheduledTime)
    .sort((a, b) => new Date(a.scheduledTime ?? 0).getTime() - new Date(b.scheduledTime ?? 0).getTime())
    .slice(0, 4);

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl p-3">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
        <CalendarDays size={16} /> Next Blocks
      </h3>
      {upcoming.length > 0 ? (
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          {upcoming.map((task) => (
            <div key={task.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2">
              <span className="w-14 shrink-0 font-mono text-xs text-amber-100">
                {format(new Date(task.scheduledTime!), 'h:mm a')}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-gray-200">{task.title}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/10 py-3 text-center text-sm text-gray-500">
          No scheduled blocks.
        </div>
      )}
    </div>
  );
}
