"use client";

import { Inbox } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { DraftCard } from "@/components/tasks/draft-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/lib/hooks/use-tasks";

export function TaskQueue() {
  const tasks = useTasks();
  const newId = useSearchParams().get("new");

  // The one orchestrated reveal: scroll the just-created card into view.
  useEffect(() => {
    if (newId && tasks.isSuccess) {
      document.getElementById(`task-${newId}`)?.scrollIntoView({ block: "center" });
    }
  }, [newId, tasks.isSuccess]);

  if (tasks.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
    );
  }
  if (tasks.isError) {
    return (
      <p className="font-mono text-xs text-destructive">
        Couldn’t load tasks — check that the backend is running.
      </p>
    );
  }
  if (tasks.data.data.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No drafts yet."
        action={
          <Link href="/lead-discovery" className="text-sm font-medium text-primary hover:underline">
            Generate one from your saved leads →
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-4">
      {tasks.data.data.map((t) => (
        <DraftCard key={t.id} task={t} reveal={t.id === newId} />
      ))}
    </div>
  );
}