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
import UpcomingEvents from './UpcomingEvents';
import MissionPulse from './MissionPulse';
import { format, parseISO } from 'date-fns';
import { LogOut, CalendarCheck2, CalendarDays, Clock3, ListTodo, Sparkles } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';
import { useAuth } from '@/components/AuthProvider';

type MobileView = 'plan' | 'queue' | 'blocks';

const MOBILE_VIEWS: { label: string; value: MobileView; icon: typeof CalendarDays }[] = [
  { label: 'Plan', value: 'plan', icon: CalendarDays },
  { label: 'Queue', value: 'queue', icon: ListTodo },
  { label: 'Blocks', value: 'blocks', icon: Clock3 },
];

function InsightRail({ showTimer }: { showTimer: boolean }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden">
      {showTimer && <FocusTimer />}
      <MissionPulse />
    </div>
  );
}

export default function Workspace() {
  const tasks = useTaskStore((state) => state.tasks);
  const moveTask = useTaskStore((state) => state.moveTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('queue');
  const showTimeBlock = useTaskStore((state) => state.showTimeBlock);
  const showTimer = useTaskStore((state) => state.showTimer);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  
  // Hydration fix for zustand
  const mounted = useIsClient();
  const { signOut } = useAuth();
  const clearTasks = useTaskStore(state => state.clearTasks);

  const handleSignOut = async () => {
    clearTasks();
    await signOut();
  };

  const fetchTasks = useTaskStore(state => state.fetchTasks);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
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

  if (!mounted) return null; // Avoid SSR hydration mismatch with persistence

  const dayTasks = tasks.filter((task) => task.date === selectedDate);
  const completedCount = dayTasks.filter((task) => task.status === 'completed').length;
  const scheduledMinutes = dayTasks.reduce((total, task) => {
    if (task.status !== 'scheduled') return total;
    return total + (task.duration ?? 30);
  }, 0);
  const totalOpen = dayTasks.filter((task) => task.status !== 'completed').length;
  const selectedLabel = format(parseISO(selectedDate), 'EEE, MMM d');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full min-h-0 w-full max-w-[1540px] flex-1 flex-col gap-3 sm:gap-4">
        {!isExpanded && (
          <header className="glass-panel flex shrink-0 flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 relative">
            <div className="min-w-0 flex items-start justify-between sm:block">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80 sm:text-xs">
                  <Sparkles size={14} />
                  Orbit planner
                </div>
                <h1 className="mt-1 truncate text-xl font-semibold text-white sm:text-3xl">
                  {selectedLabel}
                </h1>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 sm:absolute sm:-top-2 sm:-right-2 sm:p-2.5"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs sm:min-w-[420px] sm:text-sm">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 sm:p-3">
                <div className="flex items-center gap-1.5 text-gray-400 sm:gap-2">
                  <ListTodo size={15} />
                  Open
                </div>
                <div className="mt-1 text-lg font-semibold text-white sm:text-xl">{totalOpen}</div>
              </div>
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] p-2 sm:p-3">
                <div className="flex items-center gap-1.5 text-emerald-100/80 sm:gap-2">
                  <CalendarCheck2 size={15} />
                  Done
                </div>
                <div className="mt-1 text-lg font-semibold text-white sm:text-xl">{completedCount}</div>
              </div>
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.08] p-2 sm:p-3">
                <div className="flex items-center gap-1.5 text-amber-100/80 sm:gap-2">
                  <Clock3 size={15} />
                  Blocked
                </div>
                <div className="mt-1 text-lg font-semibold text-white sm:text-xl">{Math.round(scheduledMinutes / 60 * 10) / 10}h</div>
              </div>
            </div>
          </header>
        )}

        <div className="relative flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
          <div className={`hidden min-h-0 flex-col gap-4 overflow-hidden transition-all duration-300 lg:flex ${isExpanded ? 'w-full flex-1' : 'lg:flex-[0.78]'}`}>
            <div className={isExpanded ? 'min-h-0 flex-1' : 'min-h-0 shrink-0'}>
              <SleekCalendar isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />
            </div>
          </div>

          {!isExpanded && (
            <div className="glass-panel hidden min-h-0 flex-col overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-300 lg:flex lg:flex-[2]">
              <BacklogList />
            </div>
          )}

          {!isExpanded && showTimeBlock && (
            <div className="hidden min-h-0 flex-col gap-4 animate-in slide-in-from-right-4 duration-300 lg:flex lg:flex-[1.25]">
              <div className="glass-panel flex min-h-0 flex-[1.6] flex-col overflow-hidden rounded-xl">
                <CalendarGrid />
              </div>
              <div className="min-h-0 flex-[0.85]">
                <MissionPulse />
              </div>
            </div>
          )}

          {!isExpanded && !showTimeBlock && (
            <aside className="hidden min-h-0 animate-in fade-in slide-in-from-right-4 duration-300 lg:flex lg:flex-[0.95]">
              <InsightRail showTimer={showTimer} />
            </aside>
          )}

          {!isExpanded && (
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:hidden">
              {showTimer && <FocusTimer />}
              <div className="glass-panel grid shrink-0 grid-cols-3 gap-1 rounded-xl p-1">
                {MOBILE_VIEWS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setMobileView(item.value)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                        mobileView === item.value
                          ? 'bg-white text-black'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className={`${mobileView === 'plan' ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col gap-3 overflow-hidden`}>
                <SleekCalendar isExpanded={false} onToggleExpand={() => setIsExpanded(true)} />
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-3">
                    <GoalsWidget />
                    <UpcomingEvents />
                  </div>
                </div>
              </div>

              <div className={`${mobileView === 'queue' ? 'flex' : 'hidden'} glass-panel min-h-0 flex-1 flex-col overflow-hidden rounded-xl`}>
                <BacklogList />
              </div>

              <div className={`${mobileView === 'blocks' ? 'flex' : 'hidden'} glass-panel min-h-0 flex-1 flex-col overflow-hidden rounded-xl`}>
                <CalendarGrid />
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="flex min-h-0 flex-1 lg:hidden">
              <SleekCalendar isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(false)} />
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
