"use client";

import { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useTaskStore } from '@/store/useTaskStore';
import TaskCard from './TaskCard';
import { format, parseISO } from 'date-fns';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function TimeSlot({ date, hour }: { date: string; hour: number }) {
  const timeString = `${hour.toString().padStart(2, '0')}:00`;
  const slotId = `time-slot-${timeString}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
  });

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const setSelectedTask = useTaskStore((state) => state.setSelectedTask);

  const slotTasks = tasks.filter(
    (t) => 
      t.date === date && 
      t.scheduledTime && 
      new Date(t.scheduledTime).getHours() === hour &&
      (t.status === 'scheduled' || t.status === 'completed')
  );

  const handleSlotClick = (e: React.MouseEvent) => {
    // Only create a task if clicking the empty slot, not a task card inside it
    if (e.target === e.currentTarget) {
      const scheduledTime = new Date(`${date}T${timeString}:00`).toISOString();
      addTask({
        title: 'New Block',
        status: 'scheduled',
        scheduledTime,
        date,
      });
      // SelectedTask needs the ID, but addTask doesn't return it and we aren't passing it.
      // We can omit setting the selected task, or we can just let it create the block.
      // Or we can let it be, and the user can click the block to open it.
    }
  };

  const hourLabel = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;

  return (
    <div className="flex group min-h-[60px]">
      {/* Time Label */}
      <div className="w-16 shrink-0 pt-2 pr-3 text-right">
        <span className="text-[11px] font-mono font-medium text-neutral-500 uppercase tracking-widest">{hourLabel}</span>
      </div>
      
      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        onClick={handleSlotClick}
        className={`flex-1 relative border-l border-white/[0.06] border-t p-2 transition-colors cursor-crosshair min-h-[60px]
          ${isOver ? 'bg-emerald-500/10 border-emerald-500/20' : 'hover:bg-white/[0.02]'}
          ${hour === 23 ? 'border-b' : ''}
        `}
      >
        <div className="flex flex-col gap-2 relative z-10 pointer-events-none">
          {slotTasks.map((task) => (
            <div key={task.id} className="pointer-events-auto">
              <TaskCard task={task} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CalendarGrid() {
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const tasks = useTaskStore((state) => state.tasks);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);

  const dayTasks = tasks.filter((t) => t.date === selectedDate && (t.status === 'scheduled' || t.status === 'completed'));
  const totalHours = dayTasks.reduce((acc, task) => acc + (task.duration || 30) / 60, 0);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      // Scroll to current hour minus 1 so it's not right at the top
      const scrollPosition = Math.max(0, (currentHour - 1) * 60);
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  // Update "NOW" marker position every minute
  useEffect(() => {
    const updateMarker = () => {
      if (nowRef.current && selectedDate === format(new Date(), 'yyyy-MM-dd')) {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        // Each hour block is roughly 60px min-h + borders. We use percentage.
        // Actually since we use a flex layout, calculating exact pixel position is tricky.
        // A simple way is to position it absolute to a wrapper inside the scroll container.
      }
    };
    updateMarker();
    const interval = setInterval(updateMarker, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const now = new Date();
  const topPosition = (now.getHours() * 60) + now.getMinutes(); // 1 minute = 1px assuming 60px per hour

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-4 pb-3 flex items-center justify-between border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white tracking-tight">Schedule</h2>
        <div className="flex gap-3 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          <span>{dayTasks.length} blocks</span>
          <span>{totalHours.toFixed(1)}h total</span>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="relative pb-10">
          {isToday && (
            <div 
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: `${topPosition}px`, transform: 'translateY(-50%)' }}
            >
              <div className="w-16 shrink-0 pr-3 text-right">
                <span className="text-[10px] font-bold text-red-500 tracking-wider">NOW</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-px bg-red-500/50" />
            </div>
          )}

          {HOURS.map((hour) => (
            <TimeSlot key={hour} date={selectedDate} hour={hour} />
          ))}
        </div>
      </div>
    </div>
  );
}
