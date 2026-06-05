import { StructuredTaskForm } from "@/components/capture/structured-task-form";
import { cn } from "@/lib/random/utils";
import { formatBacklogTask } from "@/lib/stores/capture-store";
import type { BacklogTask } from "@/lib/stores/capture-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useState } from "react";

export const BacklogPanel = () => {
  const { enabled } = useShortcutsMode("editingBacklog");
  if (!enabled) return null;
  return <BacklogEditor />;
};

const BacklogEditor = () => {
  const tasks = usePlanningStore((s) => s.tasks);
  const postponedTasks = usePlanningStore((s) => s.postponedTasks);
  const removeTask = usePlanningStore((s) => s.removeTask);
  const postponeTask = usePlanningStore((s) => s.postponeTask);
  const activateTask = usePlanningStore((s) => s.activateTask);

  const [mode, setMode] = useState<"normal" | "edit" | "delete">("normal");
  const [editedTask, setEditedTask] = useState<BacklogTask | undefined>();

  const enterEdit = (task?: BacklogTask) => {
    setEditedTask(task);
    setMode("edit");
  };

  const exitEdit = () => {
    setEditedTask(undefined);
    setMode("normal");
  };

  const { disableModes, enableMode } = useShortcuts({
    name: "editingBacklog",
    enabled: true,
    keys: (key) => {
      if (mode === "edit") return false;
      if (key === "Escape") {
        if (mode === "delete") {
          setMode("normal");
          return true;
        }
        disableModes(["editingBacklog"]);
        return true;
      }
      if (key === "e") {
        enableMode("backlogTaskForm");
        enterEdit(undefined);
        return true;
      }
      if (key === "d" && mode === "normal") {
        setMode("delete");
        return true;
      }
      return false;
    },
  });

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold">Backlog</h2>
        <button
          type="button"
          onClick={() => disableModes(["editingBacklog"])}
          className="text-muted-foreground hover:text-foreground font-mono text-xs"
        >
          Esc to close
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-8">
        {/* Left: both task lists */}
        <div className="flex min-w-0 flex-col gap-4 overflow-y-auto">
          {/* Active backlog */}
          <div className="flex flex-col gap-2">
            {tasks.length === 0 && postponedTasks.length === 0 && (
              <p className="text-muted-foreground font-mono text-xs">
                No tasks yet. Press e to add one.
              </p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "rounded border p-3 font-mono text-xs transition-colors",
                  editedTask?.id === task.id
                    ? "border-foreground"
                    : "border-border"
                )}
              >
                <pre className="whitespace-pre-wrap">
                  {formatBacklogTask(task)}
                </pre>
              </div>
            ))}
          </div>

          {/* Postponed */}
          {postponedTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground font-mono text-xs">
                Postponed
              </p>
              {postponedTasks.map((task) => (
                <div
                  key={task.id}
                  className="border-border rounded border p-3 font-mono text-xs opacity-50"
                >
                  <pre className="whitespace-pre-wrap">
                    {formatBacklogTask(task)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: utils panel */}
        <div className="flex min-w-0 flex-col gap-4">
          {(mode === "normal" || mode === "delete") && (
            <div className="flex flex-col gap-2">
              {mode === "normal" && (
                <button
                  type="button"
                  onClick={() => {
                    enableMode("backlogTaskForm");
                    enterEdit(undefined);
                  }}
                  className="text-muted-foreground hover:text-foreground rounded border px-3 py-1.5 text-left font-mono text-xs"
                >
                  + add task <span className="opacity-50">e</span>
                </button>
              )}

              {mode === "delete" && (
                <>
                  <p className="text-destructive font-mono text-xs">
                    Click a task to delete it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode("normal")}
                    className="text-muted-foreground hover:text-foreground w-fit font-mono text-xs"
                  >
                    ← exit delete mode
                  </button>
                </>
              )}

              {tasks.length > 0 && (
                <>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">
                    {mode === "delete" ? "Tasks:" : "Edit tasks:"}
                  </p>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => mode === "delete" && removeTask(task.id)}
                      className={cn(
                        "flex items-center gap-2 rounded px-1 py-0.5 font-mono text-xs transition-colors",
                        mode === "delete"
                          ? "hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                          : "cursor-default"
                      )}
                    >
                      <span className="text-muted-foreground min-w-8">
                        #{task.id}
                      </span>
                      <span className="flex-1 truncate">{task.name}</span>
                      {mode === "normal" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              enableMode("backlogTaskForm");
                              enterEdit(task);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            edit
                          </button>
                          <button
                            type="button"
                            onClick={() => postponeTask(task.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            postpone
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {mode === "normal" && (
                    <button
                      type="button"
                      onClick={() => setMode("delete")}
                      className="text-muted-foreground hover:text-destructive mt-2 w-fit font-mono text-xs"
                    >
                      enter delete mode
                    </button>
                  )}
                </>
              )}

              {postponedTasks.length > 0 && mode === "normal" && (
                <>
                  <p className="text-muted-foreground mt-2 font-mono text-xs">
                    Postponed:
                  </p>
                  {postponedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 font-mono text-xs opacity-60"
                    >
                      <span className="text-muted-foreground min-w-8">
                        #{task.id}
                      </span>
                      <span className="flex-1 truncate">{task.name}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => activateTask(task.id)}
                          className="text-muted-foreground hover:text-foreground opacity-100"
                        >
                          for today
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTask(task.id)}
                          className="text-muted-foreground hover:text-destructive opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {mode === "edit" && (
            <StructuredTaskForm
              editedTask={editedTask}
              onDone={exitEdit}
              shortcutNames={{
                form: "backlogTaskForm",
                step: "backlogTaskFormStep",
                disableOnDone: ["backlogTaskForm"],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
