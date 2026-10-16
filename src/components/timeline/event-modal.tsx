import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDeferredFocus } from "@/hooks/use-deferred-focus";
import { useSimpleForm } from "@/hooks/use-simple-form";
import type {
  NewTimelineEvent,
  TimelineEvent,
} from "@/lib/timeline/timeline-models";
import { isInputFocused } from "@/shared-lib/shortcuts/is-input-focused";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { EVENT_MODAL_SHORTCUTS } from "@/lib/shortcuts/shortcut-mappings";
import { useEffect, useRef } from "react";

type EventFormValues = {
  name: string;
  rawTime: string;
  durationMinutes: number;
};

const defaultValues = (item?: TimelineEvent): EventFormValues => ({
  name: item?.name ?? "",
  rawTime: item?.rawTime ?? "",
  durationMinutes: item?.durationMinutes ?? 30,
});

type Props = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (item: NewTimelineEvent) => void;
  editing?: TimelineEvent;
};

export function EventModal({ opened, onClose, onSubmit, editing }: Props) {
  const { values, field, setValues, reset } = useSimpleForm<EventFormValues>(
    defaultValues(editing)
  );
  const nameRef = useRef<HTMLInputElement>(null);
  useDeferredFocus(nameRef, opened);

  useEffect(() => {
    if (opened) setValues(defaultValues(editing));
  }, [opened]);

  const handleSubmit = () => {
    if (!values.name.trim()) return;
    onSubmit({
      type: "event",
      name: values.name.trim(),
      rawTime: values.rawTime,
      durationMinutes: values.durationMinutes,
    });
    reset();
    onClose();
  };

  useShortcuts({
    name: "eventModal",
    enabled: opened,
    keys: (key, event) => {
      if (isInputFocused() && key !== "Enter") return true;
      if (key === EVENT_MODAL_SHORTCUTS.submit) {
        event.preventDefault();
        handleSubmit();
        return true;
      }
      return true;
    },
  });

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm" initialFocus={false}>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit event" : "New event"}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="event-name">Name</FieldLabel>
            <Input
              id="event-name"
              placeholder="Team meeting, lunch, etc."
              ref={nameRef}
              value={values.name}
              onChange={(e) => field("name").onChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="event-time">Time (HH:MM)</FieldLabel>
              <Input
                id="event-time"
                className="font-mono"
                placeholder="14:30"
                value={values.rawTime}
                onChange={(e) => field("rawTime").onChange(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="event-duration">Duration (min)</FieldLabel>
              <Input
                id="event-duration"
                className="font-mono"
                type="number"
                min={5}
                step={5}
                value={values.durationMinutes}
                onChange={(e) =>
                  field("durationMinutes").onChange(Number(e.target.value))
                }
              />
            </Field>
          </div>
        </FieldGroup>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{editing ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
