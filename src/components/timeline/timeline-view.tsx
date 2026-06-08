import {
  isMilestone,
  isTimelineEvent,
  type Milestone,
  type NewMilestone,
  type NewTimelineEvent,
  type TimelineEvent,
} from "@/lib/timeline/timeline-models";
import {
  useSoonEvents,
  toSuggestedMilestone,
} from "@/lib/timeline/use-soon-events";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import { showUndoNotification } from "@/lib/notifications/show-undo-notification";
import { Window as W, type UiWindow } from "@/shared-lib/shortcuts/window";
import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { EventModal } from "./event-modal";
import { MilestoneCard } from "./milestone-card";
import { MilestoneModal } from "./milestone-modal";
import classes from "./timeline-view.module.css";
import { getMinutesUntil } from "@/lib/notifications/notifications-utils";

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const parseTimeComponent = (
  rawTime: string
): { h: number; m: number } | null => {
  const match = rawTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  return { h, m };
};

const isEventBehind = (event: TimelineEvent): boolean => {
  if (event.completed) return false;
  const time = parseTimeComponent(event.rawTime);
  if (!time) return false;
  return getMinutesUntil(time.h, time.m) < 0;
};

export function TimelineView() {
  const items = useTimelineStore((s) => s.items);
  const addItem = useTimelineStore((s) => s.addItem);
  const editItem = useTimelineStore((s) => s.editItem);
  const archiveItem = useTimelineStore((s) => s.archiveItem);
  const restoreItem = useTimelineStore((s) => s.restoreItem);
  const reorder = useTimelineStore((s) => s.reorder);

  const milestones = items.filter(isMilestone);
  const activeMilestones = milestones.filter((m) => !m.completed);
  const events = useMemo(
    () =>
      items
        .filter(isTimelineEvent)
        .sort((a, b) => a.rawTime.localeCompare(b.rawTime)),
    [items]
  );

  const [windowData, setWindowData] = useState<UiWindow>(W.create());
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<
    Milestone | undefined
  >();
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>();

  const windowRef = useRef(windowData);
  windowRef.current = windowData;
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setWindowData((w) => W.shrinkTo(w, activeMilestones.length));
  }, [activeMilestones.length]);

  useEffect(() => {
    milestoneRefs.current[windowData.cursor]?.scrollIntoView({
      block: "nearest",
    });
  }, [windowData.cursor]);

  const deleteWithUndo = (item: ReturnType<typeof items.find>) => {
    if (!item) return;
    archiveItem(item.id);
    showUndoNotification(`del-${item.id}`, `"${item.name}" removed`, () =>
      restoreItem(item)
    );
  };

  useShortcuts({
    name: "timelineView",
    enabled: !milestoneModalOpen && !eventModalOpen,
    keys: (key, event) => {
      const n = activeMilestones.length;
      if (key === "n") {
        setEditingMilestone(undefined);
        setMilestoneModalOpen(true);
        return true;
      }
      if (key === "v") {
        setEditingEvent(undefined);
        setEventModalOpen(true);
        return true;
      }
      if (key === "j" || key === "ArrowDown") {
        event.preventDefault();
        setWindowData((w) => W.moveSingle(w, 1, n));
        return true;
      }
      if (key === "k" || key === "ArrowUp") {
        event.preventDefault();
        setWindowData((w) => W.moveSingle(w, -1, n));
        return true;
      }
      if (key === "J") {
        const cur = windowRef.current.cursor;
        const item = activeMilestones[cur];
        if (item && cur < n - 1) {
          const nextItem = activeMilestones[cur + 1];
          const fromIdx = items.findIndex((t) => t.id === item.id);
          const toIdx = nextItem
            ? items.findIndex((t) => t.id === nextItem.id)
            : fromIdx;
          reorder(fromIdx, toIdx);
          setWindowData((w) => W.moveSingle(w, 1, n));
        }
        return true;
      }
      if (key === "K") {
        const cur = windowRef.current.cursor;
        const item = activeMilestones[cur];
        if (item && cur > 0) {
          const prevItem = activeMilestones[cur - 1];
          const fromIdx = items.findIndex((t) => t.id === item.id);
          const toIdx = prevItem
            ? items.findIndex((t) => t.id === prevItem.id)
            : fromIdx;
          reorder(fromIdx, toIdx);
          setWindowData((w) => W.moveSingle(w, -1, n));
        }
        return true;
      }
      if (key === "e") {
        const item = activeMilestones[windowRef.current.cursor];
        if (item) {
          setEditingMilestone(item);
          setMilestoneModalOpen(true);
        }
        return true;
      }
      if (key === "a") {
        const item = activeMilestones[windowRef.current.cursor];
        if (item) {
          editItem({ ...item, completed: true });
        }
        return true;
      }
      return false;
    },
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const fromItem = milestones[result.source.index];
    const toItem = milestones[result.destination.index];
    if (!fromItem || !toItem) return;
    const fromIdx = items.findIndex((t) => t.id === fromItem.id);
    const toIdx = items.findIndex((t) => t.id === toItem.id);
    reorder(fromIdx, toIdx);
  };

  const handleMilestoneSubmit = (newItem: NewMilestone) => {
    if (editingMilestone) {
      editItem({ ...editingMilestone, ...newItem });
    } else {
      addItem(newItem);
    }
    setEditingMilestone(undefined);
  };

  const handleEventSubmit = (newItem: NewTimelineEvent) => {
    if (editingEvent) {
      editItem({ ...editingEvent, ...newItem });
    } else {
      addItem(newItem);
    }
    setEditingEvent(undefined);
  };

  const selectedMilestone = activeMilestones[windowData.cursor];
  const {
    soonEvents: visibleSoonEvents,
    useSuggestedEvent,
    dismissSuggestedEvent,
  } = useSoonEvents(events);

  const addSuggestedEvent = (event: TimelineEvent) => {
    addItem(toSuggestedMilestone(event));
    archiveItem(event.id);
    useSuggestedEvent(event);
  };

  return (
    <Box>
      <MilestoneModal
        opened={milestoneModalOpen}
        onClose={() => {
          setMilestoneModalOpen(false);
          setEditingMilestone(undefined);
        }}
        onSubmit={handleMilestoneSubmit}
        editing={editingMilestone}
      />
      <EventModal
        opened={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setEditingEvent(undefined);
        }}
        onSubmit={handleEventSubmit}
        editing={editingEvent}
      />

      <Grid>
        <Grid.Col span={7}>
          <Group justify="space-between" mb="md">
            <Title order={3}>Timeline</Title>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                n=new · e=edit · a=done · j/k=nav · J/K=move
              </Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<Plus size={14} />}
                onClick={() => {
                  setEditingMilestone(undefined);
                  setMilestoneModalOpen(true);
                }}
              >
                New
              </Button>
            </Group>
          </Group>

          {activeMilestones.length === 0 && (
            <Text c="dimmed" size="sm">
              No active milestones. Press <kbd>n</kbd> to add one.
            </Text>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="milestones">
              {(provided) => (
                <Stack
                  gap="xs"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {milestones.map((item, idx) => {
                    const isSelected =
                      !item.completed && selectedMilestone?.id === item.id;
                    const activeIdx = activeMilestones.findIndex(
                      (m) => m.id === item.id
                    );
                    return (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={idx}
                      >
                        {(drag) => (
                          <MilestoneCard
                            item={item}
                            drag={drag}
                            isSelected={isSelected}
                            activeIdx={activeIdx}
                            milestoneRef={(el) => {
                              milestoneRefs.current[activeIdx] = el;
                            }}
                            onSelect={() =>
                              setWindowData((w) => W.withCursor(w, activeIdx))
                            }
                            onEdit={() => {
                              setEditingMilestone(item);
                              setMilestoneModalOpen(true);
                            }}
                            onToggleDone={() =>
                              editItem({ ...item, completed: !item.completed })
                            }
                            onDelete={() => deleteWithUndo(item)}
                          />
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
          </DragDropContext>

          {visibleSoonEvents.length > 0 && (
            <Stack gap="xs" mt="md">
              {visibleSoonEvents.map(({ event }) => (
                <MilestoneCard
                  key={event.id}
                  variant="suggested"
                  item={toSuggestedMilestone(event)}
                  isSelected={false}
                  activeIdx={-1}
                  milestoneRef={() => {}}
                  onSelect={() => {}}
                  onEdit={() => {}}
                  onToggleDone={() => {}}
                  onDelete={() => {}}
                  onUseSuggestion={() => addSuggestedEvent(event)}
                  onDismissSuggestion={() => dismissSuggestedEvent(event.id)}
                />
              ))}
            </Stack>
          )}
        </Grid.Col>

        <Grid.Col span={5}>
          <Group justify="space-between" mb="md">
            <Title order={3}>Events</Title>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                v=new event
              </Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<Plus size={14} />}
                onClick={() => {
                  setEditingEvent(undefined);
                  setEventModalOpen(true);
                }}
              >
                Add
              </Button>
            </Group>
          </Group>

          {events.length === 0 && (
            <Text c="dimmed" size="sm">
              No events today. Press <kbd>v</kbd> to add one.
            </Text>
          )}

          <Stack gap="xs">
            {events.map((ev) => (
              <Box
                key={ev.id}
                className={`${classes.eventCard} ${isEventBehind(ev) ? classes.overdueEvent : ""}`}
                p="sm"
              >
                <Group justify="space-between" wrap="nowrap">
                  <Box>
                    <Text size="sm" fw={500}>
                      {ev.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {ev.rawTime} · {formatDuration(ev.durationMinutes)}
                    </Text>
                  </Box>
                  <Group gap={4}>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={() => {
                        setEditingEvent(ev);
                        setEventModalOpen(true);
                      }}
                    >
                      <Pencil size={12} />
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => deleteWithUndo(ev)}
                    >
                      <Trash2 size={12} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Box>
            ))}
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
