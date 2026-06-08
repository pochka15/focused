import { useEffect, useState } from "react";
import { getMinutesUntil } from "@/lib/notifications/notifications-utils";
import { tagsMapping } from "@/lib/todos/mappings";
import type { Milestone, TimelineEvent } from "./timeline-models";

const SOON_THRESHOLD_MINUTES = 30;

export type SoonEvent = {
  event: TimelineEvent;
  show: boolean;
};

const parseRawTime = (
  rawTime: string
): { timeH: number; timeM: number } | null => {
  const match = rawTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const timeH = Number(match[1]);
  const timeM = Number(match[2]);
  if (
    Number.isNaN(timeH) ||
    Number.isNaN(timeM) ||
    timeH < 0 ||
    timeH > 23 ||
    timeM < 0 ||
    timeM > 59
  ) {
    return null;
  }

  return { timeH, timeM };
};

const isSoonEvent = (event: TimelineEvent): boolean => {
  if (event.completed) return false;
  const time = parseRawTime(event.rawTime);
  if (!time) return false;
  return getMinutesUntil(time.timeH, time.timeM) <= SOON_THRESHOLD_MINUTES;
};

export const toSuggestedMilestone = (event: TimelineEvent): Milestone => ({
  id: event.id,
  type: "task",
  name: `[${event.rawTime}] ${event.name}`,
  ...tagsMapping.other.autoFill,
});

export const useSoonEvents = (events: TimelineEvent[]) => {
  const [soonEvents, setSoonEvents] = useState<SoonEvent[]>([]);
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTick((value) => value + 1);
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setSoonEvents((prev) => {
      const showById = new Map(
        prev.map((entry) => [entry.event.id, entry.show])
      );
      return events.filter(isSoonEvent).map((event) => ({
        event,
        show: showById.get(event.id) ?? true,
      }));
    });
  }, [events, nowTick]);

  const useSuggestedEvent = (event: TimelineEvent) => {
    setSoonEvents((prev) =>
      prev.map((entry) =>
        entry.event.id === event.id ? { ...entry, show: false } : entry
      )
    );
  };

  const dismissSuggestedEvent = (eventId: string) => {
    setSoonEvents((prev) =>
      prev.map((entry) =>
        entry.event.id === eventId ? { ...entry, show: false } : entry
      )
    );
  };

  const visibleSoonEvents = soonEvents.filter((entry) => entry.show);

  return {
    soonEvents: visibleSoonEvents,
    useSuggestedEvent,
    dismissSuggestedEvent,
  };
};
