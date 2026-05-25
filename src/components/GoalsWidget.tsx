"use client";

import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Target, Edit2, Plus, Trash2, X, Check } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';
import { useGoalStore, Goal } from '@/store/useGoalStore';
import { useEffect, useState } from 'react';

export default function GoalsWidget() {
  const mounted = useIsClient();
  const fetchGoals = useGoalStore(state => state.fetchGoals);
  const goals = useGoalStore(state => state.goals);
  const addGoal = useGoalStore(state => state.addGoal);
  const updateGoal = useGoalStore(state => state.updateGoal);
  const deleteGoal = useGoalStore(state => state.deleteGoal);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newDate, setNewDate] = useState('');

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (!mounted) return null;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newStartDate) return;
    
    await addGoal({
      title: newTitle,
      start_date: new Date(newStartDate).toISOString(),
      target_date: new Date(newDate).toISOString(),
    });
    setNewTitle('');
    setNewStartDate('');
    setNewDate('');
    setIsAdding(false);
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditStartDate(goal.start_date ? goal.start_date.split('T')[0] : '');
    setEditTargetDate(goal.target_date ? goal.target_date.split('T')[0] : '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editTargetDate || !editStartDate) return;
    await updateGoal(id, {
      title: editTitle,
      start_date: new Date(editStartDate).toISOString(),
      target_date: new Date(editTargetDate).toISOString(),
    });
    setEditingId(null);
  };

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          <Target size={16} /> Long-Term Goals
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`rounded p-1 transition-colors ${isAdding ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          {isAdding ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:none] min-h-0">
        {isAdding && (
          <form onSubmit={handleAddGoal} className="mb-4 flex flex-col gap-2 rounded-lg border border-dashed border-white/20 p-3">
            <input
              type="text"
              placeholder="Goal title (e.g., Learn French)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
              required
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-0.5 block">Start Date</label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full rounded bg-white/5 px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 [color-scheme:dark]"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 mb-0.5 block">Target Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded bg-white/5 px-2 py-1 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 [color-scheme:dark]"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={!newTitle.trim() || !newDate || !newStartDate}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded bg-white/10 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              <Plus size={14} /> Add Goal
            </button>
          </form>
        )}

        <div className="grid min-h-0 gap-2">
          {goals.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
              <p className="text-xs">No goals set.</p>
              <button onClick={() => setIsAdding(true)} className="mt-2 text-xs text-emerald-400 hover:underline">
                Add your first goal
              </button>
            </div>
          )}
          {goals.map(goal => {
            if (editingId === goal.id) {
              return (
                <div key={goal.id} className="flex flex-col gap-2 rounded-lg border border-white/20 bg-white/[0.08] p-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full rounded bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark]"
                    />
                    <input
                      type="date"
                      value={editTargetDate}
                      onChange={(e) => setEditTargetDate(e.target.value)}
                      className="w-full rounded bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button onClick={() => deleteGoal(goal.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                      <X size={14} />
                    </button>
                    <button onClick={() => handleSaveEdit(goal.id)} className="rounded p-1.5 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300">
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              );
            }

            let targetDate = new Date();
            let startDate = new Date();
            try {
              if (goal.target_date) targetDate = parseISO(goal.target_date);
              if (goal.start_date) startDate = parseISO(goal.start_date);
            } catch (e) {}

            const now = new Date();
            const totalDays = Math.max(1, differenceInCalendarDays(targetDate, startDate));
            const daysPassed = differenceInCalendarDays(now, startDate);
            const daysLeft = differenceInCalendarDays(targetDate, now);
            
            const progressPercent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

            return (
              <div key={goal.id} className="group relative flex min-w-0 flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.06]">
                <div className="flex min-w-0 items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 font-medium text-gray-100 break-words pr-6">{goal.title}</span>
                  <span className="shrink-0 font-mono text-xs text-emerald-100">{daysLeft > 0 ? `${daysLeft}d` : 'Done!'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
                  <span>{format(startDate, 'MMM d')} - {format(targetDate, 'MMM d, yyyy')}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40 mt-1">
                  <div 
                    className="h-full rounded-full bg-emerald-300 transition-all duration-500 relative" 
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                  </div>
                </div>
                
                <button 
                  onClick={() => startEditing(goal)}
                  className="absolute right-2 top-2 rounded p-1 text-gray-500 transition-all hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                  title="Edit goal"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
