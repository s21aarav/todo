"use client";

import Workspace from '@/components/Workspace';
import TaskModal from '@/components/TaskModal';
import AuthScreen from '@/components/AuthScreen';
import { useAuth } from '@/components/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center text-white/50">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden p-3 sm:p-6">
      <main className="flex-1 flex flex-col items-center min-h-0">
        <Workspace />
      </main>
      <TaskModal />
    </div>
  );
}
