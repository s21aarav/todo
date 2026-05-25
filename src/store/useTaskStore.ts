import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabaseClient';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export type TaskStatus = 'backlog' | 'scheduled' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskEnergy = 'light' | 'medium' | 'deep';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  subtasks: Subtask[];
  tags: string[];
  status: TaskStatus;
  date: string; // ISO format string: YYYY-MM-DD
  scheduledTime?: string; // ISO String representation of Date
  duration?: number; // in minutes
  priority?: TaskPriority;
  energy?: TaskEnergy;
  createdAt?: string;
  completedAt?: string;
}

type NewTask = {
  title: string;
  notes?: string;
  tags?: string[];
  priority?: TaskPriority;
  energy?: TaskEnergy;
  scheduledTime?: string;
  duration?: number;
  status?: TaskStatus;
  date?: string;
};

interface TaskState {
  tasks: Task[];
  selectedTaskId: string | null;
  selectedDate: string;
  showTimeBlock: boolean;
  showTimer: boolean;
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  setSelectedTask: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  setShowTimeBlock: (show: boolean) => void;
  setShowTimer: (show: boolean) => void;
  addTask: (task: NewTask) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, status: TaskStatus, scheduledTime?: string, date?: string) => Promise<void>;
  completeTask: (id: string, completed: boolean) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      selectedDate: new Date().toISOString().split('T')[0],
      showTimeBlock: false,
      showTimer: false,
      isLoading: false,

      fetchTasks: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase.from('tasks').select('*');
        if (!error && data) {
          set({ tasks: data as Task[], isLoading: false });
        } else {
          set({ isLoading: false });
          console.error("Error fetching tasks:", error);
        }

        // Realtime Subscription
        supabase.channel('custom-all-channel')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks' },
            (payload) => {
              const currentTasks = get().tasks;
              if (payload.eventType === 'INSERT') {
                const existing = currentTasks.find(t => t.id === payload.new.id);
                if (!existing) set({ tasks: [...currentTasks, payload.new as Task] });
              } else if (payload.eventType === 'UPDATE') {
                set({ tasks: currentTasks.map(t => t.id === payload.new.id ? payload.new as Task : t) });
              } else if (payload.eventType === 'DELETE') {
                set({ tasks: currentTasks.filter(t => t.id === payload.old.id) });
              }
            }
          )
          .subscribe();
      },

      setSelectedTask: (id) => set({ selectedTaskId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setShowTimeBlock: (show) => set({ showTimeBlock: show }),
      setShowTimer: (show) => set({ showTimer: show }),

      addTask: async (task) => {
        const newTask: Task = {
          id: generateId(),
          title: task.title,
          notes: task.notes ?? '',
          subtasks: [],
          tags: task.tags ?? [],
          status: task.status ?? 'backlog',
          date: task.date ?? get().selectedDate,
          scheduledTime: task.scheduledTime,
          duration: task.duration ?? 30,
          priority: task.priority ?? 'medium',
          energy: task.energy ?? 'medium',
          createdAt: new Date().toISOString(),
        };

        // Optimistic UI update
        set((state) => ({ tasks: [...state.tasks, newTask] }));

        // Async db update
        const { error } = await supabase.from('tasks').insert(newTask);
        if (error) console.error("Error adding task:", error);
      },

      updateTask: async (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        await supabase.from('tasks').update(updates).eq('id', id);
      },

      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        await supabase.from('tasks').delete().eq('id', id);
      },

      moveTask: async (id, status, scheduledTime, date) => {
        const targetDate = date ?? get().tasks.find(t => t.id === id)?.date;
        const sTime = status === 'scheduled' ? scheduledTime : null;
        const cTime = status === 'completed' ? new Date().toISOString() : null;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  date: targetDate as string,
                  scheduledTime: sTime ?? undefined,
                  completedAt: cTime ?? undefined,
                }
              : t
          ),
        }));

        await supabase.from('tasks').update({
          status,
          date: targetDate,
          scheduledTime: sTime,
          completedAt: cTime,
        }).eq('id', id);
      },

      completeTask: async (id, completed) => {
        const status = completed ? 'completed' : 'backlog';
        const completedAt = completed ? new Date().toISOString() : null;
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  scheduledTime: completed ? t.scheduledTime : undefined,
                  completedAt: completedAt ?? undefined,
                }
              : t
          ),
        }));

        const task = get().tasks.find(t => t.id === id);
        await supabase.from('tasks').update({
          status,
          scheduledTime: completed ? task?.scheduledTime : null,
          completedAt,
        }).eq('id', id);
      },

      addSubtask: async (taskId, title) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        const newSubtasks = [
          ...(task.subtasks ?? []),
          { id: generateId(), title, completed: false },
        ];
        
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, subtasks: newSubtasks } : t)),
        }));
        
        await supabase.from('tasks').update({ subtasks: newSubtasks }).eq('id', taskId);
      },

      toggleSubtask: async (taskId, subtaskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        
        const newSubtasks = (task.subtasks ?? []).map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: newSubtasks } : t
          ),
        }));

        await supabase.from('tasks').update({ subtasks: newSubtasks }).eq('id', taskId);
      },

      deleteSubtask: async (taskId, subtaskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        
        const newSubtasks = (task.subtasks ?? []).filter((subtask) => subtask.id !== subtaskId);

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: newSubtasks } : t
          ),
        }));

        await supabase.from('tasks').update({ subtasks: newSubtasks }).eq('id', taskId);
      },
    }),
    {
      name: 'space-pwa-ui-state',
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        showTimeBlock: state.showTimeBlock,
        showTimer: state.showTimer,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<TaskState>),
        selectedTaskId: null,
      }),
    }
  )
);
