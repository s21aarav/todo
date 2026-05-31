"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { Task, TaskEnergy, TaskPriority, TaskStatus, useTaskStore } from '@/store/useTaskStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CalendarClock, Check, Flag, ListChecks, Plus, Save, Sparkles, Timer, X } from 'lucide-react';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
const ENERGY: TaskEnergy[] = ['light', 'medium', 'deep'];
const STATUSES: TaskStatus[] = ['backlog', 'scheduled', 'completed'];

const PRIORITY_PILL: Record<TaskPriority, string> = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  medium: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  critical: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const STATUS_PILL: Record<TaskStatus, string> = {
  backlog: 'bg-white/[0.06] text-neutral-400 border-white/[0.08]',
  scheduled: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

const ENERGY_PILL: Record<TaskEnergy, string> = {
  light: 'bg-white/[0.06] text-neutral-400 border-white/[0.08]',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  deep: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

function initialTime(task: Task) {
  if (!task.scheduledTime) return '09:00';
  const scheduled = new Date(task.scheduledTime);
  return `${scheduled.getHours().toString().padStart(2, '0')}:${scheduled.getMinutes().toString().padStart(2, '0')}`;
}

export default function TaskModal() {
  const selectedTaskId = useTaskStore((state) => state.selectedTaskId);
  const tasks = useTaskStore((state) => state.tasks);
  const task = tasks.find((t) => t.id === selectedTaskId);
  
  const setSelectedTask = useTaskStore((state) => state.setSelectedTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const addSubtask = useTaskStore((state) => state.addSubtask);
  const toggleSubtask = useTaskStore((state) => state.toggleSubtask);
  const deleteSubtask = useTaskStore((state) => state.deleteSubtask);

  // Use refs to keep track of current values for unmount auto-save
  const stateRef = useRef({
    title: task?.title || '',
    notes: task?.notes || '',
    tags: (task?.tags ?? []).join(', '),
    priority: task?.priority ?? 'medium',
    energy: task?.energy ?? 'medium',
    duration: task?.duration ?? 30,
    status: task?.status || 'backlog',
    date: task?.date || '',
    time: task ? initialTime(task) : '09:00',
  });

  const [title, setTitle] = useState(stateRef.current.title);
  const [notes, setNotes] = useState(stateRef.current.notes);
  const [tags, setTags] = useState(stateRef.current.tags);
  const [priority, setPriority] = useState<TaskPriority>(stateRef.current.priority);
  const [energy, setEnergy] = useState<TaskEnergy>(stateRef.current.energy);
  const [duration, setDuration] = useState(stateRef.current.duration);
  const [status, setStatus] = useState<TaskStatus>(stateRef.current.status);
  const [date, setDate] = useState(stateRef.current.date);
  const [time, setTime] = useState(stateRef.current.time);
  const [newSubtask, setNewSubtask] = useState('');

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = { title, notes, tags, priority, energy, duration, status, date, time };
  }, [title, notes, tags, priority, energy, duration, status, date, time]);

  // Reset state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
      setTags((task.tags ?? []).join(', '));
      setPriority(task.priority ?? 'medium');
      setEnergy(task.energy ?? 'medium');
      setDuration(task.duration ?? 30);
      setStatus(task.status);
      setDate(task.date);
      setTime(initialTime(task));
    }
  }, [task?.id]); // Only run when task ID changes

  // Auto-save on unmount
  useEffect(() => {
    if (!task) return;
    
    return () => {
      const state = stateRef.current;
      const cleanTags = state.tags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
        .filter(Boolean);
      const scheduledTime = state.status === 'scheduled' ? new Date(`${state.date}T${state.time}:00`).toISOString() : undefined;

      updateTask(task.id, {
        title: state.title.trim() || task.title,
        notes: state.notes,
        tags: cleanTags,
        priority: state.priority,
        energy: state.energy,
        duration: state.duration,
        status: state.status,
        date: state.date,
        scheduledTime,
        completedAt: state.status === 'completed' && task.status !== 'completed' ? new Date().toISOString() : undefined,
      });
    };
  }, [task?.id, updateTask]);

  if (!task) return null;

  const completion = (() => {
    const subtasks = task.subtasks ?? [];
    if (!subtasks.length) return 0;
    return Math.round((subtasks.filter((subtask) => subtask.completed).length / subtasks.length) * 100);
  })();

  const handleAddSubtask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl sm:p-6"
      onClick={() => setSelectedTask(null)} // Clicking backdrop closes modal, triggering unmount auto-save
    >
      <div
        className="flex flex-col w-full h-full sm:h-[85vh] sm:max-h-[800px] sm:max-w-4xl sm:rounded-2xl border-0 sm:border border-white/[0.06] bg-black sm:bg-white/[0.03] sm:backdrop-blur-3xl overflow-hidden shadow-2xl shadow-black/60 animate-fade-in"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ── Header ── */}
        <header className="shrink-0 border-b border-white/[0.06] bg-white/[0.02] p-4 safe-top">
          <div className="flex items-start gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-white placeholder:text-neutral-600 focus:outline-none"
            />
            <button
              onClick={() => setSelectedTask(null)}
              className="grid min-h-[44px] min-w-[44px] place-items-center rounded-xl bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          
          {/* Main Content Area (Notes & Subtasks) */}
          <div className="min-h-0 flex-1 overflow-y-auto border-b sm:border-b-0 sm:border-r border-white/[0.06] p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Notes Section */}
            <section className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <Sparkles size={14} /> Notes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write in markdown..."
                  className="w-full min-h-[200px] sm:min-h-[300px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus:border-emerald-500/30 focus:bg-white/[0.04] focus:outline-none transition-colors resize-none"
                />
                <div className="min-h-[200px] sm:min-h-[300px] rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-sm text-neutral-300 prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {notes ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                  ) : (
                    <span className="text-neutral-600">Preview will appear here...</span>
                  )}
                </div>
              </div>
            </section>

            {/* Subtasks Section */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <ListChecks size={14} /> Subtasks
                </h3>
                {task.subtasks && task.subtasks.length > 0 && (
                  <span className="text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {completion}% Done
                  </span>
                )}
              </div>

              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-emerald-500/30 focus:bg-white/[0.04] focus:outline-none transition-colors"
                  placeholder="Add a subtask..."
                />
                <button
                  type="submit"
                  disabled={!newSubtask.trim()}
                  className="grid min-h-[44px] min-w-[44px] place-items-center rounded-xl bg-white/[0.06] text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </form>

              <div className="mt-3 flex flex-col gap-2">
                {(task.subtasks ?? []).map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex min-h-[44px] items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 hover:bg-white/[0.04] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                      className={`grid min-h-[36px] min-w-[36px] shrink-0 place-items-center rounded-full border transition-all duration-200 ${
                        subtask.completed
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                          : 'border-white/[0.12] text-neutral-500 hover:border-emerald-500/30 hover:text-emerald-400'
                      }`}
                    >
                      {subtask.completed && <Check size={14} />}
                    </button>
                    <span
                      className={`min-w-0 flex-1 text-sm ${
                        subtask.completed ? 'text-neutral-500 line-through' : 'text-neutral-300'
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteSubtask(task.id, subtask.id)}
                      className="grid min-h-[36px] min-w-[36px] place-items-center rounded-lg text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Meta Properties */}
          <div className="flex w-full sm:w-72 shrink-0 flex-col overflow-y-auto bg-black/20 p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex-1 space-y-6">
              
              {/* Status */}
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold capitalize transition-all duration-200 ${
                        status === s ? STATUS_PILL[s] : 'border-transparent bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold capitalize transition-all duration-200 ${
                        priority === p ? PRIORITY_PILL[p] : 'border-transparent bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Energy</label>
                <div className="flex flex-wrap gap-2">
                  {ENERGY.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEnergy(e)}
                      className={`min-h-[36px] rounded-lg border px-3 text-xs font-semibold capitalize transition-all duration-200 ${
                        energy === e ? ENERGY_PILL[e] : 'border-transparent bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                    <CalendarClock size={12} /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-500/30 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                      <Timer size={12} /> Duration
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 pr-8 text-sm text-white focus:border-emerald-500/30 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">min</span>
                    </div>
                  </div>
                  
                  {status === 'scheduled' && (
                    <div className="animate-fade-in">
                      <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                        Time
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-sm text-white focus:border-emerald-500/30 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  <Flag size={12} /> Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, health, urgent"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-white focus:border-emerald-500/30 focus:bg-white/[0.04] focus:outline-none transition-colors"
                />
              </div>

            </div>

            {/* Save Button */}
            <div className="mt-6 shrink-0 pt-4 border-t border-white/[0.06] pb-4 sm:pb-0 safe-bottom">
              <button
                onClick={() => setSelectedTask(null)}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-black hover:bg-emerald-400 transition-colors"
              >
                <Save size={18} />
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
