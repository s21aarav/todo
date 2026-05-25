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
  const priorityClass: Record<TaskPriority, string> = {
    low: 'border-emerald-300/25 bg-emerald-300/[0.06] text-emerald-100',
    medium: 'border-cyan-300/25 bg-cyan-300/[0.06] text-cyan-100',
    high: 'border-amber-300/30 bg-amber-300/[0.08] text-amber-100',
    critical: 'border-rose-300/35 bg-rose-300/[0.10] text-rose-100',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-panel group rounded-lg border transition-colors ${
        compact ? 'p-2' : 'p-3'
      } ${
        isOverlay ? 'scale-105 shadow-2xl border-white/20 bg-white/5' : ''
      } ${isCompleted ? 'opacity-60' : ''} hover:bg-white/5`}
      onClick={() => {
        if (!isDragging) {
          setSelectedTask(task.id);
        }
      }}
    >
      <div className={`flex ${compact ? 'items-center gap-2' : 'items-start gap-3'}`}>
        <button
          type="button"
          title={isCompleted ? 'Reopen task' : 'Complete task'}
          onClick={(event) => {
            event.stopPropagation();
            completeTask(task.id, !isCompleted);
          }}
          className={`mt-0.5 grid shrink-0 place-items-center rounded-full border transition-colors ${
            compact ? 'size-5' : 'size-7'
          } ${
            isCompleted
              ? 'border-emerald-300/30 bg-emerald-300/20 text-emerald-100'
              : 'border-white/15 text-gray-500 hover:border-emerald-300/30 hover:text-emerald-100'
          }`}
        >
          {isCompleted ? <Check size={compact ? 12 : 15} /> : <Circle size={compact ? 10 : 13} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <span className={`block min-w-0 flex-1 font-medium text-gray-100 transition-colors group-hover:text-white ${
              compact ? 'truncate text-[11px]' : 'text-sm'
            } ${isCompleted ? 'line-through decoration-white/40' : ''}`}>
              {task.title}
            </span>
            {compact && (
              <div {...attributes} {...listeners} className="touch-none rounded p-0.5 text-gray-600 transition-colors hover:text-white" onClick={(e) => e.stopPropagation()}>
                <GripVertical size={12} />
              </div>
            )}
            {!compact && (
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityClass[priority]}`}>
                {priority}
              </span>
            )}
          </div>

          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <Clock3 size={12} />
                {task.duration ?? 30}m
              </span>
              {task.scheduledTime && (
                <span>{format(new Date(task.scheduledTime), 'h:mm a')}</span>
              )}
              {task.notes && (
                <span className="flex items-center gap-1">
                  <StickyNote size={12} />
                  notes
                </span>
              )}
              {(task.tags ?? []).slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {!compact && subtasks.length > 0 && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 text-[10px] font-mono text-gray-500">
                {completedSubtasks}/{subtasks.length}
              </div>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Delete task"
              onClick={(event) => {
                event.stopPropagation();
                deleteTask(task.id);
              }}
              className="grid size-8 place-items-center rounded-md text-gray-600 opacity-0 transition-all hover:bg-rose-400/10 hover:text-rose-200 group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
            <div {...attributes} {...listeners} className="touch-none rounded-md p-2 text-gray-600 transition-colors hover:bg-white/10 hover:text-white" onClick={(e) => e.stopPropagation()}>
              <GripVertical size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
