"use client";

import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { useTaskStore } from '@/store/useTaskStore';

export default function SleekCalendar() {
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const setSelectedDate = useTaskStore((state) => state.setSelectedDate);
  const tasks = useTaskStore((state) => state.tasks);
  const showTimer = useTaskStore((state) => state.showTimer);
  const setShowTimer = useTaskStore((state) => state.setShowTimer);

  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-card p-4 sm:p-5 animate-fade-in shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-tight uppercase">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => {
              const today = new Date();
              setCurrentMonth(today);
              setSelectedDate(format(today, 'yyyy-MM-dd'));
            }}
            className="rounded-md bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTimer(!showTimer)}
            title="Toggle Focus Timer"
            className={`min-h-[44px] min-w-[44px] grid place-items-center rounded-lg transition-colors ${
              showTimer ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300'
            }`}
          >
            <Timer size={18} />
          </button>
          
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="min-h-[44px] min-w-[44px] grid place-items-center rounded-lg text-neutral-500 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          
          // Count tasks for this day
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const hasTasks = dayTasks.length > 0;
          const hasIncomplete = dayTasks.some(t => t.status !== 'completed');

          return (
            <button
              key={dateStr}
              onClick={() => {
                setSelectedDate(dateStr);
                if (!isCurrentMonth) setCurrentMonth(day);
              }}
              className={`relative min-h-[40px] w-full flex flex-col items-center justify-center rounded-lg transition-all duration-200
                ${!isCurrentMonth ? 'text-neutral-700' : isSelected ? 'bg-white text-black font-bold' : isTodayDate ? 'border border-emerald-500/50 text-emerald-400 font-bold bg-emerald-500/5' : 'text-neutral-300 hover:bg-white/[0.06]'}
              `}
            >
              <span className="text-sm z-10">{format(day, dateFormat)}</span>
              
              {/* Task Indicator Dot */}
              {hasTasks && (
                <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                  isSelected ? 'bg-black/50' : hasIncomplete ? 'bg-emerald-400' : 'bg-neutral-600'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
