"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority, useTaskStore } from '@/store/useTaskStore';
import { Check, Circle, Clock3, GripVertical, StickyNote, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  compact?: boolean;
}

const PRIORITY_BAR_COLOR: Record<TaskPriority, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-cyan-500',
  high: 'bg-amber-500',
  critical: 'bg-rose-500',
};

const PRIORITY_PILL_CLASS: Record<TaskPriority, string> = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  medium: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  critical: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

export default function TaskCard({ task, isOverlay, compact }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
  const completeTask = useTaskStore((state) => state.completeTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
  const priority = task.priority ?? 'medium';
  const isCompleted = task.status === 'completed';

  /* ── Compact mode (inside time blocks) ── */
  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-2 transition-all duration-200 hover:bg-white/[0.06] ${
          isOverlay ? 'scale-105 shadow-2xl shadow-black/60 border-white/[0.12] bg-white/[0.06]' : ''
        } ${isCompleted ? 'opacity-50' : ''}`}
        onClick={() => {
          if (!isDragging) setSelectedTask(task.id);
        }}
      >
        {/* Priority bar */}
        <div className={`w-[3px] self-stretch rounded-full ${PRIORITY_BAR_COLOR[priority]}`} />

        {/* Checkbox */}
        <button
          type="button"
          title={isCompleted ? 'Reopen task' : 'Complete task'}
          onClick={(event) => {
            event.stopPropagation();
            completeTask(task.id, !isCompleted);
          }}
          className={`grid shrink-0 size-6 min-h-[44px] min-w-[44px] place-items-center rounded-full border transition-all duration-200 ${
            isCompleted
              ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
              : 'border-white/[0.12] text-neutral-600 hover:border-emerald-500/30 hover:text-emerald-400'
          }`}
        >
          {isCompleted ? <Check size={12} /> : <Circle size={10} />}
        </button>

        {/* Title */}
        <span
          className={`min-w-0 flex-1 truncate text-xs font-medium text-neutral-300 transition-colors ${
            isCompleted ? 'line-through decoration-white/30' : ''
          }`}
        >
          {task.title}
        </span>

        {/* Grip */}
        <div
          {...attributes}
          {...listeners}
          className="touch-none rounded-lg p-1.5 min-h-[44px] min-w-[44px] grid place-items-center text-neutral-600 transition-all duration-200 hover:text-neutral-400"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
      </div>
    );
  }

  /* ── Normal mode ── */
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-2xl transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.10] ${
        isOverlay ? 'scale-[1.03] shadow-2xl shadow-black/60 border-white/[0.12] bg-white/[0.06]' : ''
      } ${isCompleted ? 'opacity-50' : ''}`}
      onClick={() => {
        if (!isDragging) setSelectedTask(task.id);
      }}
    >
      {/* Priority bar — left edge */}
      <div className={`w-[3px] shrink-0 rounded-l-xl ${PRIORITY_BAR_COLOR[priority]}`} />

      <div className="flex flex-1 min-w-0 items-start gap-3 p-3">
        {/* Checkbox */}
        <button
          type="button"
          title={isCompleted ? 'Reopen task' : 'Complete task'}
          onClick={(event) => {
            event.stopPropagation();
            completeTask(task.id, !isCompleted);
          }}
          className={`mt-0.5 grid shrink-0 size-7 min-h-[44px] min-w-[44px] place-items-center rounded-full border transition-all duration-200 ${
            isCompleted
              ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
              : 'border-white/[0.12] text-neutral-600 hover:border-emerald-500/30 hover:text-emerald-400'
          }`}
        >
          {isCompleted ? <Check size={14} /> : <Circle size={13} />}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <span
              className={`block min-w-0 flex-1 text-sm font-medium text-white leading-snug ${
                isCompleted ? 'line-through decoration-white/30 text-neutral-400' : ''
              }`}
            >
              {task.title}
            </span>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${PRIORITY_PILL_CLASS[priority]}`}
            >
              {priority}
            </span>
          </div>

          {/* Meta badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            {/* Duration */}
            <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 text-neutral-400">
              <Clock3 size={11} />
              {task.duration ?? 30}m
            </span>

            {/* Scheduled time */}
            {task.scheduledTime && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 text-neutral-400">
                {format(new Date(task.scheduledTime), 'h:mm a')}
              </span>
            )}

            {/* Notes indicator */}
            {task.notes && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.06] px-2 py-0.5 text-neutral-400">
                <StickyNote size={11} />
              </span>
            )}

            {/* Tags */}
            {(task.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 text-emerald-400/80"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Subtask progress */}
          {subtasks.length > 0 && (
            <div className="mt-2.5">
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-mono text-neutral-500">
                {completedSubtasks}/{subtasks.length} subtasks
              </p>
            </div>
          )}
        </div>

        {/* Right-side actions — ALWAYS VISIBLE */}
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <button
            type="button"
            title="Delete task"
            onClick={(event) => {
              event.stopPropagation();
              deleteTask(task.id);
            }}
            className="grid min-h-[44px] min-w-[44px] place-items-center rounded-lg text-neutral-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="touch-none grid min-h-[44px] min-w-[44px] place-items-center rounded-lg text-neutral-600 transition-all duration-200 hover:bg-white/[0.08] hover:text-neutral-400"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
