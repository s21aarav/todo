"use client";

import { useMemo, useState } from 'react';
import { Task, TaskEnergy, TaskPriority, TaskStatus, useTaskStore } from '@/store/useTaskStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CalendarClock, Check, Flag, ListChecks, Plus, Save, Sparkles, Timer, X } from 'lucide-react';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
const ENERGY: TaskEnergy[] = ['light', 'medium', 'deep'];
const STATUSES: TaskStatus[] = ['backlog', 'scheduled', 'completed'];

function initialTime(task: Task) {
  if (!task.scheduledTime) return '09:00';
  const scheduled = new Date(task.scheduledTime);
  return `${scheduled.getHours().toString().padStart(2, '0')}:${scheduled.getMinutes().toString().padStart(2, '0')}`;
}

function TaskModalContent({ task }: { task: Task }) {
  const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const addSubtask = useTaskStore((state) => state.addSubtask);
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);
  const deleteSubtask = useTaskStore((state) => state.deleteSubtask);

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [tags, setTags] = useState((task.tags ?? []).join(', '));
  const [priority, setPriority] = useState<TaskPriority>(task.priority ?? 'medium');
  const [energy, setEnergy] = useState<TaskEnergy>(task.energy ?? 'medium');
  const [duration, setDuration] = useState(task.duration ?? 30);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [date, setDate] = useState(task.date);
  const [time, setTime] = useState(initialTime(task));
  const [newSubtask, setNewSubtask] = useState('');

  const completion = useMemo(() => {
    const subtasks = task.subtasks ?? [];
    if (!subtasks.length) return 0;
    return Math.round((subtasks.filter((subtask) => subtask.completed).length / subtasks.length) * 100);
  }, [task.subtasks]);

  const saveTask = () => {
    const cleanTags = tags
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
      .filter(Boolean);
    const scheduledTime = status === 'scheduled' ? new Date(`${date}T${time}:00`).toISOString() : undefined;

    updateTask(task.id, {
      title: title.trim() || task.title,
      notes,
      tags: cleanTags,
      priority,
      energy,
      duration,
      status,
      date,
      scheduledTime,
      completedAt: status === 'completed' ? task.completedAt ?? new Date().toISOString() : undefined,
    });
  };

  const handleAddSubtask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  return (
    <div
      className="glass-panel flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl shadow-2xl shadow-black/50"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
            <Sparkles size={13} />
            Task cockpit
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full min-w-0 bg-transparent text-xl font-semibold text-white outline-none placeholder:text-gray-600"
            placeholder="Task title"
          />
        </div>
        <button onClick={() => setSelectedTask(null)} className="grid size-10 shrink-0 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
          <X size={22} />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-white/10 bg-black/25 p-4 lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm normal-case text-white outline-none">
                {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm normal-case text-white outline-none">
                {PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Energy
              <select value={energy} onChange={(event) => setEnergy(event.target.value as TaskEnergy)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm normal-case text-white outline-none">
                {ENERGY.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Estimate
              <input type="number" min={5} step={5} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm normal-case text-white outline-none" />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              <CalendarClock size={14} />
              Schedule
            </div>
            <div className="grid gap-2">
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none" />
              <input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white outline-none" />
            </div>
          </div>

          <label className="mt-4 flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Tags
            <input value={tags} onChange={(event) => setTags(event.target.value)} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm normal-case text-white outline-none placeholder:text-gray-600" placeholder="exam, revision, build" />
          </label>

          <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
            <div className="flex items-center justify-between text-sm text-emerald-100">
              <span className="flex items-center gap-2"><ListChecks size={15} /> Progress</span>
              <span className="font-mono">{completion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </aside>

        <section className="min-w-0 p-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                  <Timer size={15} />
                  Notes
                </h3>
                <button onClick={saveTask} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200">
                  <Save size={15} />
                  Save
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[340px] w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-gray-200 outline-none placeholder:text-gray-600"
                placeholder="Markdown notes"
              />
            </div>

            <div className="min-w-0">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                <Flag size={15} />
                Preview & subtasks
              </h3>
              <div className="min-h-[160px] rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <div className="prose prose-invert prose-sm max-w-none text-gray-300 prose-a:text-emerald-200 prose-strong:text-white">
                  {notes ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                  ) : (
                    <span className="text-gray-600">No notes yet.</span>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddSubtask} className="mt-4 flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(event) => setNewSubtask(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600"
                  placeholder="Add subtask"
                />
                <button type="submit" className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-white transition-colors hover:bg-white/10">
                  <Plus size={18} />
                </button>
              </form>

              <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-y-auto">
                {(task.subtasks ?? []).map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
                    <button type="button" onClick={() => toggleSubtask(task.id, subtask.id)} className={`grid size-7 shrink-0 place-items-center rounded-full border ${subtask.completed ? 'border-emerald-300/30 bg-emerald-300/20 text-emerald-100' : 'border-white/15 text-gray-500'}`}>
                      {subtask.completed && <Check size={14} />}
                    </button>
                    <span className={`min-w-0 flex-1 truncate text-sm text-gray-200 ${subtask.completed ? 'line-through opacity-60' : ''}`}>{subtask.title}</span>
                    <button type="button" onClick={() => deleteSubtask(task.id, subtask.id)} className="grid size-8 place-items-center rounded-md text-gray-600 transition-colors hover:bg-rose-400/10 hover:text-rose-200">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function TaskModal() {
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
  const tasks = useTaskStore((state) => state.tasks);
  const task = tasks.find(t => t.id === selectedTaskId);

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4" onClick={() => setSelectedTask(null)}>
      <TaskModalContent key={task.id} task={task} />
    </div>
  );
}
