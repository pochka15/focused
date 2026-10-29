import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Notification } from "@/lib/notifications/notifications-models";
import {
  resetNotificationTimes,
} from "@/lib/notifications/notifications-utils";
import { parseRepeatDuration } from "@/lib/notifications/repeat-duration-utils";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { ChevronDown, ChevronUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function newNotification(): Notification {
  return {
    id: crypto.randomUUID(),
    notificationName: "",
    timeH: 9,
    timeM: 0,
    repeatsInMinutes: 0,
    isComplete: false,
  };
}

function formatRepeats(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

type RepeatsInputProps = {
  minutes: number;
  onChange: (minutes: number) => void;
};

function RepeatsInput({ minutes, onChange }: RepeatsInputProps) {
  const [text, setText] = useState(() => formatRepeats(minutes));
  const [focused, setFocused] = useState(false);

  // Only follow external updates while the field isn't being edited.
  useEffect(() => {
    if (!focused) setText(formatRepeats(minutes));
  }, [minutes, focused]);

  return (
    <Input
      className="h-8 font-mono"
      autoComplete="off"
      placeholder="1h 20m"
      value={text}
      aria-invalid={parseRepeatDuration(text) === null}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const next = e.target.value;
        setText(next);
        const parsed = parseRepeatDuration(next);
        if (parsed !== null) onChange(parsed);
      }}
      onBlur={() => {
        setFocused(false);
        setText(formatRepeats(minutes));
      }}
    />
  );
}

export function NotificationsView() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const addNotification = useNotificationsStore((s) => s.addNotification);
  const editNotification = useNotificationsStore((s) => s.editNotification);
  const removeNotification = useNotificationsStore((s) => s.removeNotification);
  const moveNotification = useNotificationsStore((s) => s.moveNotification);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);

  const lastNameRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (updated: Notification) => {
    editNotification(updated);
  };

  const handleAddRow = () => {
    addNotification(newNotification());
    setTimeout(() => lastNameRef.current?.focus(), 0);
  };

  const handleReset = () => {
    setNotifications(resetNotificationTimes(notifications));
  };

  useShortcuts({
    name: "notificationsView",
    enabled: true,
    keys: () => {
      const el = document.activeElement as HTMLElement | null;
      return el?.tagName === "INPUT" || el?.tagName === "TEXTAREA";
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wider uppercase">
          Notifications
        </h2>
        <div className="flex gap-2">
          <Button size="xs" variant="ghost" onClick={handleReset}>
            <RotateCcw data-icon="inline-start" />
            Reset times
          </Button>
          <Button size="xs" variant="outline" onClick={handleAddRow}>
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Move</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-28">HH : MM</TableHead>
            <TableHead className="w-28">Repeats</TableHead>
            <TableHead className="w-14">Done</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((n, idx) => {
            const isLast = idx === notifications.length - 1;
            return (
              <TableRow key={n.id}>
                <TableCell>
                  <div className="flex gap-0.5">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={idx === 0}
                      onClick={() => moveNotification(n.id, -1)}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={isLast}
                      onClick={() => moveNotification(n.id, 1)}
                    >
                      <ChevronDown />
                    </Button>
                  </div>
                </TableCell>

                <TableCell>
                  <Input
                    ref={isLast ? lastNameRef : undefined}
                    className="h-8"
                    autoComplete="off"
                    value={n.notificationName}
                    onChange={(e) =>
                      handleFieldChange({
                        ...n,
                        notificationName: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Tab" && !e.shiftKey && isLast) {
                        e.preventDefault();
                        handleAddRow();
                      }
                    }}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    <Input
                      className="h-8 w-10 text-center font-mono"
                      type="number"
                      min={0}
                      max={23}
                      autoComplete="off"
                      value={n.timeH}
                      onChange={(e) =>
                        handleFieldChange({
                          ...n,
                          timeH: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="font-mono text-muted-foreground">:</span>
                    <Input
                      className="h-8 w-10 text-center font-mono"
                      type="number"
                      min={0}
                      max={59}
                      autoComplete="off"
                      value={n.timeM}
                      onChange={(e) =>
                        handleFieldChange({
                          ...n,
                          timeM: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <RepeatsInput
                    minutes={n.repeatsInMinutes}
                    onChange={(repeatsInMinutes) =>
                      handleFieldChange({ ...n, repeatsInMinutes })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Checkbox
                    checked={n.isComplete}
                    onCheckedChange={(checked) =>
                      editNotification({ ...n, isComplete: checked })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Input
                    className="h-8"
                    autoComplete="off"
                    value={n.notificationDescription ?? ""}
                    onChange={(e) =>
                      handleFieldChange({
                        ...n,
                        notificationDescription: e.target.value || undefined,
                      })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="hover:text-destructive"
                    disabled={notifications.length === 1}
                    onClick={() => removeNotification(n.id)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
