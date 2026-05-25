"use client";

import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Target, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useIsClient } from '@/hooks/useIsClient';
import { useGoalStore } from '@/store/useGoalStore';
import { useEffect, useState } from 'react';

export default function GoalsWidget() {
  const mounted = useIsClient();
  const fetchGoals = useGoalStore(state => state.fetchGoals);
  const goals = useGoalStore(state => state.goals);
  const addGoal = useGoalStore(state => state.addGoal);
  const deleteGoal = useGoalStore(state => state.deleteGoal);

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (!mounted) return null;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    
    await addGoal({
      title: newTitle,
      target_date: new Date(newDate).toISOString(),
    });
    setNewTitle('');
    setNewDate('');
  };

  return (
    <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-xl p-3">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          <Target size={16} /> Long-Term Goals
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`rounded p-1 transition-colors ${isEditing ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
        >
          {isEditing ? <X size={14} /> : <Edit2 size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:none] min-h-0">
        {isEditing && (
          <form onSubmit={handleAddGoal} className="mb-4 flex flex-col gap-2 rounded-lg border border-dashed border-white/20 p-3">
            <input
              type="text"
              placeholder="Goal title (e.g., Learn French)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20"
              required
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 [color-scheme:dark]"
              required
            />
            <button 
              type="submit"
              disabled={!newTitle.trim() || !newDate}
              className="mt-1 flex w-full items-center justify-center gap-1 rounded bg-white/10 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              <Plus size={14} /> Add Goal
            </button>
          </form>
        )}

        <div className="grid min-h-0 gap-2">
          {goals.length === 0 && !isEditing && (
            <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
              <p className="text-xs">No goals set.</p>
              <button onClick={() => setIsEditing(true)} className="mt-2 text-xs text-emerald-400 hover:underline">
                Add your first goal
              </button>
            </div>
          )}
          {goals.map(goal => {
            let targetDate;
            try {
              targetDate = parseISO(goal.target_date);
              if (isNaN(targetDate.getTime())) targetDate = new Date();
            } catch {
              targetDate = new Date();
            }
            const daysLeft = differenceInCalendarDays(targetDate, new Date());
            const hasProgress = goal.total_value !== undefined && goal.total_value !== null && goal.current_value !== undefined && goal.current_value !== null;
            const progressPercent = hasProgress ? (goal.current_value! / goal.total_value!) * 100 : null;

            return (
              <div key={goal.id} className="group relative flex min-w-0 flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.06]">
                <div className="flex min-w-0 items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 font-medium text-gray-100 break-words pr-4">{goal.title}</span>
                  <span className="shrink-0 font-mono text-xs text-emerald-100">{daysLeft}d</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
                  <span>{format(targetDate, 'MMM d, yyyy')}</span>
                  {hasProgress && <span>{goal.current_value}/{goal.total_value}</span>}
                </div>
                {hasProgress && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40 mt-1">
                    <div 
                      className="h-full rounded-full bg-emerald-300 transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, progressPercent!))}%` }}
                    />
                  </div>
                )}
                
                {isEditing && (
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="absolute right-2 top-2 rounded p-1 text-gray-500 opacity-0 transition-all hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                    title="Delete goal"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
