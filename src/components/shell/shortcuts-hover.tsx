import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn, tw } from "@/lib/utils";
import { Keyboard } from "lucide-react";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import {
  BACKLOG_SHORTCUTS,
  NAVIGATION_SHORTCUTS,
  ROOT_SHORTCUTS,
  TIMELINE_CARD_SHORTCUTS,
  TIMELINE_SHORTCUTS,
} from "@/lib/shortcuts/shortcut-mappings";

const NAV_SHORTCUTS_SECTION = {
  title: "Navigation",
  items: [
    `${NAVIGATION_SHORTCUTS.timeline}: timeline`,
    `${NAVIGATION_SHORTCUTS.backlog}: backlog`,
    `${NAVIGATION_SHORTCUTS.notifications}: notifications`,
  ],
};

const TIMELINE_SHORTCUTS_SECTION = {
  title: "Timeline",
  items: [
    `${TIMELINE_SHORTCUTS.newMilestone}: new milestone`,
    `${TIMELINE_SHORTCUTS.newBacklogTask}: new inbox task`,
    `${TIMELINE_SHORTCUTS.newEvent}: new event`,
    `${TIMELINE_SHORTCUTS.pickFromQueue}: pick from queue (k 1st, j 2nd)`,
    `${TIMELINE_SHORTCUTS.edit}: edit`,
    `${TIMELINE_SHORTCUTS.toggleDone}: toggle done`,
    `${TIMELINE_SHORTCUTS.moveDown}/${TIMELINE_SHORTCUTS.moveUp}: move cursor`,
    `${TIMELINE_SHORTCUTS.reorderDown}/${TIMELINE_SHORTCUTS.reorderUp}: reorder`,
    `${TIMELINE_SHORTCUTS.openNotes}: open notes`,
    `${TIMELINE_SHORTCUTS.quickNote}: quick note`,
  ],
};

const TIMELINE_CARD_SHORTCUTS_SECTION = {
  title: "Timeline card tasks (f)",
  items: [
    `${TIMELINE_CARD_SHORTCUTS.moveDown}/${TIMELINE_CARD_SHORTCUTS.moveUp}: navigate tasks`,
    `${TIMELINE_CARD_SHORTCUTS.toggleTaskDone}: cycle task state`,
    `${TIMELINE_CARD_SHORTCUTS.exit}/Escape: exit`,
  ],
};

const BACKLOG_SHORTCUTS_SECTION = {
  title: "Backlog",
  items: [
    `${BACKLOG_SHORTCUTS.newTask}: new task`,
    `${BACKLOG_SHORTCUTS.edit}: edit`,
    `${BACKLOG_SHORTCUTS.pushTimeline} / ${BACKLOG_SHORTCUTS.pushTimelineFront}: push timeline (back/front)`,
    `${BACKLOG_SHORTCUTS.postpone}: postpone`,
    `${BACKLOG_SHORTCUTS.columnLeft}/${BACKLOG_SHORTCUTS.columnRight} or arrows: sections / queue`,
    `${BACKLOG_SHORTCUTS.taskDown}/${BACKLOG_SHORTCUTS.taskUp}/${BACKLOG_SHORTCUTS.taskFirst}/${BACKLOG_SHORTCUTS.taskLast}: task nav`,
    `${BACKLOG_SHORTCUTS.shiftDown}/${BACKLOG_SHORTCUTS.shiftUp}: next/prev section`,
  ],
};

const BACKLOG_QUEUE_SHORTCUTS_SECTION = {
  title: "Queue",
  items: [
    `${BACKLOG_SHORTCUTS.toggleQueueing}: toggle queueing mode`,
    `${BACKLOG_SHORTCUTS.enqueue}/Enter: queue task (queueing mode)`,
    `${BACKLOG_SHORTCUTS.shiftDown}/${BACKLOG_SHORTCUTS.shiftUp}: reorder (queue column)`,
    `${BACKLOG_SHORTCUTS.dequeue}: remove from queue`,
    `${BACKLOG_SHORTCUTS.dequeueAll}: clear queue (queueing mode)`,
  ],
};

const NOTIFICATIONS_SHORTCUTS_SECTION = {
  title: "Notifications",
  items: [`Open Notifications with ${ROOT_SHORTCUTS.notifications}`],
};

const SHORTCUT_SECTIONS = [
  {
    route: "/",
    sections: [TIMELINE_SHORTCUTS_SECTION, TIMELINE_CARD_SHORTCUTS_SECTION],
  },
  {
    route: "/backlog",
    sections: [BACKLOG_SHORTCUTS_SECTION, BACKLOG_QUEUE_SHORTCUTS_SECTION],
  },
  {
    route: "/notifications",
    sections: [NOTIFICATIONS_SHORTCUTS_SECTION],
  },
];

type Props = {
  pathname: string;
};

const panelStyles = tw`
  max-h-[min(70vh,560px)] w-80 overflow-y-auto
`;

const pinnedPanelStyles = tw`
  absolute top-0 left-[calc(100%+8px)] z-10 bg-popover p-4
  text-popover-foreground shadow-md ring-1 ring-foreground/10
`;

// Lines look like "j/k: move cursor" — render the keys part in mono.
const ShortcutLine = ({ item }: { item: string }) => {
  const sep = item.indexOf(": ");
  if (sep < 0) return <p className="col-span-2 text-xs">{item}</p>;
  return (
    <p className="col-span-2 grid grid-cols-subgrid text-xs">
      <span className="font-mono text-muted-foreground">
        {item.slice(0, sep)}
      </span>
      <span>{item.slice(sep + 2)}</span>
    </p>
  );
};

const TriggerButton = (props: React.ComponentProps<typeof Button>) => (
  <Button
    variant="ghost"
    size="icon-sm"
    className="text-muted-foreground"
    {...props}
  />
);

export function ShortcutsHover({ pathname }: Props) {
  const { enabled } = useShortcutsMode("help");

  const { disableModes } = useShortcuts({
    name: "shortcutsHelp",
    enabled,
    keys: () => {
      disableModes(["help"]);
      return false;
    },
  });

  const routeConfig = SHORTCUT_SECTIONS.find((item) =>
    item.route === "/" ? pathname === "/" : pathname.startsWith(item.route)
  );

  const routeSections = routeConfig
    ? routeConfig.sections
    : [TIMELINE_SHORTCUTS_SECTION];

  const visibleSections = [NAV_SHORTCUTS_SECTION, ...routeSections];

  const content = (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3">
      {visibleSections.map((section, idx) => (
        <div
          key={section.title}
          className="col-span-2 grid grid-cols-subgrid content-start gap-y-1.5"
        >
          <p className="col-span-2 text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            {section.title}
          </p>
          {section.items.map((item) => (
            <ShortcutLine key={item} item={item} />
          ))}
          {idx < visibleSections.length - 1 && (
            <Separator className="col-span-2 mt-1.5" />
          )}
        </div>
      ))}
    </div>
  );

  if (enabled) {
    return (
      <div className="relative">
        <TriggerButton>
          <Keyboard />
        </TriggerButton>
        <div className={cn(panelStyles, pinnedPanelStyles)}>{content}</div>
      </div>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger delay={80} closeDelay={120} render={<TriggerButton />}>
        <Keyboard />
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className={panelStyles}>
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}
