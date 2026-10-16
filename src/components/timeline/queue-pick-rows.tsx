import { Kbd } from "@/components/ui/kbd";
import { TIMELINE_QUEUE_PICK_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { tw } from "@/lib/utils";

const rowStyles = tw`
  flex w-full max-w-4xl items-center gap-3 bg-muted/40 px-4 py-2 text-sm
  outline-1 outline-foreground/25 outline-dashed
`;

// First task is picked with "k", second with "j" — mirrors their positions.
const PICK_KEYS = [
  TIMELINE_QUEUE_PICK_SHORTCUTS.pickFirst,
  TIMELINE_QUEUE_PICK_SHORTCUTS.pickSecond,
];

type Props = {
  tasks: BacklogTask[];
  onPick: (task: BacklogTask) => void;
};

export function QueuePickRows({ tasks, onPick }: Props) {
  if (tasks.length === 0) {
    return (
      <div className={rowStyles}>
        <span className="text-xs text-muted-foreground italic">Empty</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {tasks.map((task, idx) => (
        <button
          type="button"
          key={task.id}
          className={rowStyles}
          onClick={() => onPick(task)}
        >
          <Kbd>{PICK_KEYS[idx]}</Kbd>
          <span className="truncate">
            <span className="font-mono text-muted-foreground">#{task.id}</span>{" "}
            {task.name}
          </span>
        </button>
      ))}
      <p className="text-[0.625rem] text-muted-foreground">
        <Kbd>Esc</Kbd> to cancel
      </p>
    </div>
  );
}
