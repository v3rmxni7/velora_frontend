import { Suspense } from "react";
import { TaskQueue } from "@/components/tasks/task-queue";
import { Topbar } from "@/components/shell/topbar";

export default function EngagePage() {
  return (
    <>
      <Topbar title="Tasks" />
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          {/* Suspense: TaskQueue reads ?new= via useSearchParams */}
          <Suspense fallback={null}>
            <TaskQueue />
          </Suspense>
        </div>
      </main>
    </>
  );
}