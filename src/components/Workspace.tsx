"use client";

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskStore, Task } from '@/store/useTaskStore';
import BacklogList from './BacklogList';
import CalendarGrid from './CalendarGrid';
import TaskCard from './TaskCard';
import GoalsWidget from './GoalsWidget';
import FocusTimer from './FocusTimer';
import SleekCalendar from './SleekCalendar';
import MissionPulse from './MissionPulse';
import UserProfile from './UserProfile';
import { format, parseISO } from 'date-fns';
import { CalendarCheck2, CalendarDays, Clock3, ListTodo, Sparkles, Target, Settings } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/components/AuthProvider';
import { useGoalStore } from '@/store/useGoalStore';
import { getQuoteOfDay } from '@/lib/quotes';

type MobileTab = 'tasks' | 'schedule' | 'goals' | 'more';

const MOBILE_TABS: { label: string; value: MobileTab; icon: typeof ListTodo }[] = [
  { label: 'Tasks', value: 'tasks', icon: ListTodo },
  { label: 'Schedule', value: 'schedule', icon: Clock3 },
  { label: 'Goals', value: 'goals', icon: Target },
  { label: 'More', value: 'more', icon: Settings },
];

export default function Workspace() {
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('tasks');
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const showTimer = useTaskStore((state) => state.showTimer);
  
  const mounted = useIsClient();
  const { session } = useAuth();
  const clearTasks = useTaskStore(state => state.clearTasks);
  const clearGoals = useGoalStore(state => state.clearGoals);

  const fetchTasks = useTaskStore(state => state.fetchTasks);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (overId === 'backlog') {
      moveTask(activeId, 'backlog', undefined, selectedDate);
    } else if (overId.startsWith('time-slot-')) {
      const time = overId.replace('time-slot-', '');
      const date = new Date(`${selectedDate}T${time}:00`);
      moveTask(activeId, 'scheduled', date.toISOString(), selectedDate);
    }
  };

  if (!mounted) return null;

  const dayTasks = tasks.filter((task) => task.date === selectedDate);
  const completedCount = dayTasks.filter((task) => task.status === 'completed').length;
  const totalTasks = dayTasks.length;
  const scheduledCount = dayTasks.filter((task) => task.status === 'scheduled').length;
  const selectedLabel = format(parseISO(selectedDate), 'EEE, MMM d');
  const quote = getQuoteOfDay();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="flex flex-1 flex-col lg:hidden">
        {/* Mobile Header */}
        <header className="relative shrink-0 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                <Sparkles size={11} className="shrink-0" />
                <span className="truncate">{quote}</span>
              </p>
              <h1 className="mt-0.5 text-2xl font-bold text-white">{selectedLabel}</h1>
            </div>
            <div className="shrink-0 ml-3">
              <UserProfile />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Total</p>
              <p className="text-lg font-bold text-white">{totalTasks}</p>
            </div>
            <div className="flex-1 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1] px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">Done</p>
              <p className="text-lg font-bold text-white">{completedCount}</p>
            </div>
            <div className="flex-1 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1] px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70">Scheduled</p>
              <p className="text-lg font-bold text-white">{scheduledCount}</p>
            </div>
          </div>
        </header>

        {/* Mobile Tab Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-24">
          {mobileTab === 'tasks' && (
            <div className="glass-card animate-fade-in overflow-hidden">
              <BacklogList />
            </div>
          )}

          {mobileTab === 'schedule' && (
            <div className="glass-card animate-fade-in overflow-hidden">
              <CalendarGrid />
            </div>
          )}

          {mobileTab === 'goals' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <SleekCalendar />
              <GoalsWidget />
            </div>
          )}

          {mobileTab === 'more' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              {showTimer && <FocusTimer />}
              <MissionPulse />
              <div className="glass-card p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Account</h3>
                <UserProfile isDesktop />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-black/80 backdrop-blur-2xl safe-bottom">
          <div className="flex items-stretch">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = mobileTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setMobileTab(tab.value)}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-neutral-500 active:text-neutral-300'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 h-[2px] w-12 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden h-full min-h-0 lg:flex lg:flex-col">
        {/* Desktop Header */}
        <header className="shrink-0 px-6 pb-4 pt-5">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                <Sparkles size={14} className="shrink-0" />
                {quote}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-white">{selectedLabel}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Total</p>
                  <p className="text-xl font-bold text-white">{totalTasks}</p>
                </div>
                <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1] px-4 py-2 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">Done</p>
                  <p className="text-xl font-bold text-white">{completedCount}</p>
                </div>
                <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1] px-4 py-2 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-amber-400/70">Scheduled</p>
                  <p className="text-xl font-bold text-white">{scheduledCount}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Desktop 3-Column Layout */}
        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-4 px-6 pb-6">
          {/* Left Column: Calendar + Goals */}
          <div className="flex w-[300px] shrink-0 flex-col gap-4 overflow-hidden">
            <SleekCalendar />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <GoalsWidget />
            </div>
          </div>

          {/* Center: Task List */}
          <div className="glass-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <BacklogList />
          </div>

          {/* Right Column: Schedule + MissionPulse */}
          <div className="flex w-[340px] shrink-0 flex-col gap-4 overflow-hidden">
            <div className="glass-card flex min-h-0 flex-[1.8] flex-col overflow-hidden">
              <CalendarGrid />
            </div>
            <div className="shrink-0">
              <MissionPulse />
            </div>
            {showTimer && (
              <div className="shrink-0">
                <FocusTimer />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Profile Widget */}
        <div className="fixed bottom-5 right-5 z-50">
          <UserProfile isDesktop />
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
