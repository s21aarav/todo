"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskPriority, TaskStatus, useTaskStore } from '@/store/useTaskStore';
import TaskCard from './TaskCard';
import { useState } from 'react';
import { Clock3, Gauge, Plus, Search, Zap } from 'lucide-react';

type StatusFilter = TaskStatus | 'all';

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Backlog', value: 'backlog' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Done', value: 'completed' },
];

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'L',
  medium: 'M',
  high: 'H',
  critical: '!',
};
const PRIORITY_ACTIVE_CLASSES: Record<TaskPriority, string> = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const DURATION_OPTIONS = [15, 30, 45, 60];
const DURATION_LABELS: Record<number, string> = {
  15: '15m',
  30: '30m',
  45: '45m',
  60: '1h',
};

export default function BacklogList() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const addTask = useTaskStore((state) => state.addTask);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('backlog');
  const [query, setQuery] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDuration, setNewDuration] = useState(30);

  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const visibleTasks = dayTasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const searchable = `${task.title} ${(task.tags ?? []).join(' ')} ${task.notes ?? ''}`.toLowerCase();
    return matchesStatus && searchable.includes(query.toLowerCase());
  });

  const { setNodeRef, isOver } = useDroppable({
    id: 'backlog',
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const tagMatches = Array.from(newTaskTitle.matchAll(/#([\w-]+)/g));
    const tags = tagMatches.map((match) => match[1].toLowerCase());
    const title = newTaskTitle.replace(/#[\w-]+/g, '').replace(/\s+/g, ' ').trim();
    addTask({
      title: title || newTaskTitle.trim(),
      priority: newPriority,
      duration: newDuration,
      tags,
    });
    setNewTaskTitle('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="shrink-0 p-4 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white tracking-tight">Tasks</h2>
          <span className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 text-xs font-semibold text-emerald-400 tabular-nums">
            {visibleTasks.length}
          </span>
        </div>

        {/* ── Search ── */}
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 transition-all duration-200 focus-within:border-emerald-500/30 focus-within:bg-white/[0.06]">
          <Search size={16} className="shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
          />
        </div>

        {/* ── Status Filter Pills ── */}
        <div className="mt-3 flex gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`flex-1 min-h-[36px] rounded-lg border text-xs font-semibold transition-all duration-200 ${
                statusFilter === filter.value
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : 'bg-white/[0.04] text-neutral-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-neutral-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Task List ── */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto px-4 pb-2 flex flex-col gap-3 transition-all duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isOver ? 'bg-emerald-500/[0.04]' : ''
        }`}
      >
        <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {visibleTasks.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
            <p className="text-sm text-neutral-500">No tasks here yet.</p>
            <p className="mt-1 text-xs text-neutral-600">Add one below to get started.</p>
          </div>
        )}
      </div>

      {/* ── Add Task Form ── */}
      <div className="shrink-0 border-t border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-2xl sm:p-4">
        <form onSubmit={handleAddTask} className="grid gap-2.5">
          {/* Input + Submit */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task… #tag"
              className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white transition-all duration-200 placeholder:text-neutral-600 focus:border-emerald-500/30 focus:bg-white/[0.06] focus:outline-none"
            />
            <button
              type="submit"
              title="Add task"
              className="grid min-h-[44px] min-w-[44px] place-items-center rounded-xl bg-emerald-500 text-black transition-all duration-200 hover:bg-emerald-400 active:scale-95"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Priority + Duration Selectors */}
          <div className="grid gap-2 sm:grid-cols-2">
            {/* Priority */}
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
              <Zap size={13} className="mx-1.5 shrink-0 text-neutral-500" />
              {PRIORITIES.map((priority) => (
                <button
                  type="button"
                  key={priority}
                  onClick={() => setNewPriority(priority)}
                  className={`min-h-[32px] min-w-0 flex-1 rounded-lg border text-xs font-bold transition-all duration-200 ${
                    newPriority === priority
                      ? PRIORITY_ACTIVE_CLASSES[priority]
                      : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06]'
                  }`}
                >
                  {PRIORITY_LABELS[priority]}
                </button>
              ))}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
              <Clock3 size={13} className="mx-1.5 shrink-0 text-neutral-500" />
              {DURATION_OPTIONS.map((duration) => (
                <button
                  type="button"
                  key={duration}
                  onClick={() => setNewDuration(duration)}
                  className={`min-h-[32px] min-w-0 flex-1 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                    newDuration === duration
                      ? 'bg-white/10 text-white border-white/[0.12]'
                      : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06]'
                  }`}
                >
                  {DURATION_LABELS[duration]}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
