import Workspace from '@/components/Workspace';
import TaskModal from '@/components/TaskModal';

export default function Home() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden p-3 sm:p-6">
      <main className="flex-1 flex flex-col items-center min-h-0">
        <Workspace />
      </main>
      <TaskModal />
    </div>
  );
}
