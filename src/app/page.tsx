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
      <div className="flex h-[100dvh] w-full items-center justify-center">
        <Loader2 size={24} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <>
      <Workspace />
      <TaskModal />
    </>
  );
}
