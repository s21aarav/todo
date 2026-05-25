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
  low: 'Low',
  medium: 'Med',
  high: 'High',
  critical: 'Now',
};
const DURATION_OPTIONS = [15, 30, 45, 60];

export default function BacklogList() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedDate = useTaskStore((state) => state.selectedDate);
  const showTimeBlock = useTaskStore((state) => state.showTimeBlock);
  const setShowTimeBlock = useTaskStore((state) => state.setShowTimeBlock);
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
      <div className="border-b border-white/5 bg-transparent p-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              Command Queue
            </h2>
            <p className="mt-0.5 text-xs font-mono text-gray-500">{selectedDate}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTimeBlock(!showTimeBlock)}
            title={showTimeBlock ? 'Hide schedule' : 'Show schedule'}
            className={`grid size-10 shrink-0 place-items-center rounded-lg border transition-colors ${
              showTimeBlock
                ? 'border-amber-300/30 bg-amber-300/15 text-amber-100'
                : 'border-white/10 bg-white/[0.04] text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Clock3 size={18} />
          </button>
        </div>

        <div className="mt-4 grid gap-3 2xl:grid-cols-[1fr_auto]">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
            <Search size={16} className="shrink-0 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
            />
          </div>
          <div className="flex w-full gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`flex-auto text-center whitespace-nowrap rounded-md px-2 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3 transition-colors ${isOver ? 'bg-white/5' : ''}`}
      >
        <SortableContext items={visibleTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {visibleTasks.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-500">
            Clear skies for this view.
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/5 bg-transparent p-3 backdrop-blur-md sm:p-4">
        <form onSubmit={handleAddTask} className="grid gap-2 sm:gap-3">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task"
              className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white transition-all placeholder:text-gray-600 focus:border-emerald-300/40 focus:outline-none"
            />
            <button type="submit" title="Add task" className="grid size-10 place-items-center rounded-lg border border-emerald-300/20 bg-emerald-300/15 text-emerald-50 transition-colors hover:bg-emerald-300/20">
              <Plus size={17} />
            </button>
          </div>

          <div className="grid gap-2 xl:grid-cols-2">
            <div className="flex min-w-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
              <Zap size={14} className="mx-1 shrink-0 text-gray-500" />
              {PRIORITIES.map((priority) => (
                <button
                  type="button"
                  key={priority}
                  onClick={() => setNewPriority(priority)}
                  className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                    newPriority === priority
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {PRIORITY_LABELS[priority]}
                </button>
              ))}
            </div>

            <div className="flex min-w-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
              <Gauge size={14} className="mx-1 shrink-0 text-gray-500" />
              {DURATION_OPTIONS.map((duration) => (
                <button
                  type="button"
                  key={duration}
                  onClick={() => setNewDuration(duration)}
                  className={`min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                    newDuration === duration
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
