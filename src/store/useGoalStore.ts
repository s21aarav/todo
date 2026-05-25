import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

export interface Goal {
  id: string;
  title: string;
  target_date: string; // ISO format string
  total_value?: number | null;
  current_value?: number | null;
  user_id?: string;
}

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearGoals: () => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useGoalStore = create<GoalState>()((set, get) => ({
  goals: [],
  isLoading: false,

  clearGoals: () => set({ goals: [] }),

  fetchGoals: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('goals').select('*');
    if (!error && data) {
      set({ goals: data as Goal[], isLoading: false });
    } else {
      set({ isLoading: false });
      console.error("Error fetching goals:", error);
    }
  },

  addGoal: async (goal) => {
    const newGoal: Goal = {
      id: generateId(),
      ...goal,
    };
    
    set((state) => ({ goals: [...state.goals, newGoal] }));
    const { error } = await supabase.from('goals').insert(newGoal);
    if (error) console.error("Error adding goal:", error);
  },

  updateGoal: async (id, updates) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    await supabase.from('goals').update(updates).eq('id', id);
  },

  deleteGoal: async (id) => {
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
    await supabase.from('goals').delete().eq('id', id);
  },
}));
