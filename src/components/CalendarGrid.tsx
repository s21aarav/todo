"use client";

import { useDroppable } from '@dnd-kit/core';
import { useTaskStore } from '@/store/useTaskStore';
import TaskCard from './TaskCard';
import { format, parseISO } from 'date-fns';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

function TimeSlot({ hour }: { hour: number }) {
  const timeString = `${hour.toString().padStart(2, '0')}:00`;
  const { setNodeRef, isOver } = useDroppable({
    id: `time-slot-${timeString}`,
  });

  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const scheduledTasks = tasks
    .filter((t) => {
      if (t.status !== 'scheduled' || !t.scheduledTime || t.date !== selectedDate) return false;
      const date = new Date(t.scheduledTime);
      return date.getHours() === hour;
    })
    .sort((a, b) => new Date(a.scheduledTime ?? 0).getTime() - new Date(b.scheduledTime ?? 0).getTime());

  return (
    <div className="grid min-h-[74px] grid-cols-[64px_1fr] border-b border-white/5">
      <div className="flex items-start justify-end border-r border-white/5 p-2 pr-3 font-mono text-[10px] text-gray-500">
        {format(new Date(`2020-01-01T${timeString}:00`), 'ha')}
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex min-w-0 flex-col gap-1.5 p-2 transition-colors ${
          isOver ? 'bg-white/10' : 'hover:bg-white/5'
        }`}
      >
        {scheduledTasks.map(task => (
          <TaskCard key={task.id} task={task} compact />
        ))}
      </div>
    </div>
  );
}

export default function CalendarGrid() {
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const tasks = useTaskStore((state) => state.tasks);
  const scheduled = tasks.filter((task) => task.date === selectedDate && task.status === 'scheduled');
  const minutes = scheduled.reduce((total, task) => total + (task.duration ?? 30), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b border-white/5 bg-transparent p-4 backdrop-blur-md">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white">
          Time-Block
        </h2>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{format(parseISO(selectedDate), 'MMM d')}</span>
          <span className="font-mono">{scheduled.length} blocks · {Math.round((minutes / 60) * 10) / 10}h</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => (
          <TimeSlot key={hour} hour={hour} />
        ))}
      </div>
    </div>
  );
}
