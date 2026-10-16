import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BacklogTask } from "@/lib/stores/backlog-store";
import { tw } from "@/lib/utils";
import { Check, Trash2, Zap } from "lucide-react";
import type { ReactNode } from "react";

const rowStyles = tw`
  flex items-center justify-between gap-3 bg-card px-3 py-2 shadow-xs
  ring-1 ring-foreground/5
`;

type Props = {
  postponedTasks: BacklogTask[];
  doneTasks: BacklogTask[];
  onActivate: (id: number) => void;
  onDelete: (task: BacklogTask) => void;
  onDeleteDone?: () => void;
};

const TaskRow = ({
  task,
  badges,
  actions,
}: {
  task: BacklogTask;
  badges: ReactNode;
  actions: ReactNode;
}) => (
  <div className={rowStyles}>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="truncate text-sm text-muted-foreground">
        <span className="font-mono">#{task.id}</span> {task.name}
      </p>
      <div className="flex flex-wrap gap-3">{badges}</div>
    </div>
    <div className="flex shrink-0 items-center gap-1">{actions}</div>
  </div>
);

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    size="icon-xs"
    variant="ghost"
    className="hover:text-destructive"
    onClick={onClick}
  >
    <Trash2 />
  </Button>
);

const SectionTitle = ({ label, count }: { label: string; count: number }) => (
  <span className="text-muted-foreground">
    {label} <span className="font-mono">({count})</span>
  </span>
);

export function BacklogPostponedOrDone({
  postponedTasks,
  doneTasks,
  onActivate,
  onDelete,
  onDeleteDone,
}: Props) {
  if (postponedTasks.length === 0 && doneTasks.length === 0) return null;

  return (
    <Accordion className="mt-8">
      {postponedTasks.length > 0 && (
        <AccordionItem value="postponed">
          <AccordionTrigger>
            <SectionTitle label="Postponed" count={postponedTasks.length} />
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {postponedTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  badges={
                    <>
                      {task.isNext && (
                        <Badge>
                          <Zap data-icon="inline-start" />
                          next
                        </Badge>
                      )}
                      {task.tag.trim() && (
                        <Badge variant="secondary">{task.tag}</Badge>
                      )}
                    </>
                  }
                  actions={
                    <>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onActivate(task.id)}
                      >
                        Activate
                      </Button>
                      <DeleteButton onClick={() => onDelete(task)} />
                    </>
                  }
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {doneTasks.length > 0 && (
        <AccordionItem value="done">
          <AccordionTrigger>
            <SectionTitle label="Done" count={doneTasks.length} />
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              {doneTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  badges={
                    <>
                      <Badge>
                        <Check data-icon="inline-start" />
                        done
                      </Badge>
                      {task.tag.trim() && (
                        <Badge variant="secondary">{task.tag}</Badge>
                      )}
                    </>
                  }
                  actions={<DeleteButton onClick={() => onDelete(task)} />}
                />
              ))}
            </div>
            {onDeleteDone && (
              <Button
                size="xs"
                variant="destructive"
                className="mt-3 w-full"
                onClick={onDeleteDone}
              >
                Delete All Done
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
