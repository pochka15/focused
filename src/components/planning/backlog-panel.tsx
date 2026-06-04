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
  const removeTask = usePlanningStore((s) => s.removeTask);

  const [mode, setMode] = useState<"normal" | "edit">("normal");
  const [editedTask, setEditedTask] = useState<BacklogTask | undefined>();
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);

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
      if (mode === "edit") return false; // let backlogTaskForm handle it
      if (key === "Escape") {
        disableModes(["editingBacklog"]);
        return true;
      }
      if (key === "e") {
        enableMode("backlogTaskForm");
        enterEdit(undefined);
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
        {/* Left: task list */}
        <div className="flex min-w-0 flex-col gap-2 overflow-y-auto">
          {tasks.length === 0 && (
            <p className="text-muted-foreground font-mono text-xs">
              No tasks yet. Press e to add one.
            </p>
          )}
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "group rounded border p-3 font-mono text-xs",
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

        {/* Right: utils panel */}
        <div className="flex min-w-0 flex-col gap-4">
          {mode === "normal" && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  enableMode("backlogTaskForm");
                  enterEdit(undefined);
                }}
                className="text-muted-foreground hover:text-foreground rounded border px-3 py-1.5 font-mono text-xs text-left"
              >
                + add task <span className="opacity-50">e</span>
              </button>

              {tasks.length > 0 && (
                <>
                  <p className="text-muted-foreground font-mono text-xs">
                    Edit tasks:
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteButtons((v) => !v)}
                    className="text-muted-foreground hover:text-foreground w-fit rounded border px-2 py-1 font-mono text-xs"
                  >
                    {showDeleteButtons
                      ? "hide delete buttons"
                      : "show delete buttons"}
                  </button>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 font-mono text-xs"
                    >
                      <span className="text-muted-foreground min-w-8">
                        #{task.id}
                      </span>
                      <span className="flex-1 truncate">{task.name}</span>
                      <div className="flex items-center gap-4">
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
                        {showDeleteButtons && (
                          <button
                            type="button"
                            onClick={() => removeTask(task.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            ✕
                          </button>
                        )}
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
