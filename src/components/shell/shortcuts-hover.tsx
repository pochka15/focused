import {
  Divider,
  HoverCard,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useRouterState } from "@tanstack/react-router";
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
import classes from "./shell.module.css";

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
    `${TIMELINE_SHORTCUTS.newEvent}: new event`,
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
    `${BACKLOG_SHORTCUTS.switchMode}: zen/full switch`,
    `${BACKLOG_SHORTCUTS.newTask}: new task`,
    `${BACKLOG_SHORTCUTS.edit}: edit`,
    `${BACKLOG_SHORTCUTS.pushTimeline} / ${BACKLOG_SHORTCUTS.pushTimelineFront}: push timeline (back/front)`,
    `${BACKLOG_SHORTCUTS.postpone}: postpone`,
    `${BACKLOG_SHORTCUTS.moveTask}: move task`,
    `${BACKLOG_SHORTCUTS.toggleNext}: next`,
    `${BACKLOG_SHORTCUTS.groupLeft}/${BACKLOG_SHORTCUTS.groupRight} or arrows: group nav`,
    `${BACKLOG_SHORTCUTS.taskDown}/${BACKLOG_SHORTCUTS.taskUp}/${BACKLOG_SHORTCUTS.taskFirst}/${BACKLOG_SHORTCUTS.taskLast}: task nav`,
    `${BACKLOG_SHORTCUTS.swapDown}/${BACKLOG_SHORTCUTS.swapUp}: swap`,
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
    sections: [BACKLOG_SHORTCUTS_SECTION],
  },
  {
    route: "/notifications",
    sections: [NOTIFICATIONS_SHORTCUTS_SECTION],
  },
];

type Props = {
  pathname: string;
};

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
    <Stack gap="xs">
      {visibleSections.map((section, idx) => (
        <Stack key={section.title} gap={4}>
          <Text size="xs" fw={700} c="dimmed">
            {section.title}
          </Text>
          {section.items.map((item) => (
            <Text key={item} size="xs">
              {item}
            </Text>
          ))}
          {idx < visibleSections.length - 1 && <Divider my={4} />}
        </Stack>
      ))}
    </Stack>
  );

  if (enabled) {
    return (
      <div style={{ position: "relative" }}>
        <UnstyledButton className={classes.navItem}>
          <Keyboard size={18} />
        </UnstyledButton>
        <Paper
          className={classes.shortcutsDropdown}
          shadow="md"
          withBorder
          style={{
            position: "absolute",
            top: 0,
            left: "calc(100% + 8px)",
            width: 320,
            zIndex: 10,
          }}
          p="sm"
        >
          {content}
        </Paper>
      </div>
    );
  }

  return (
    <HoverCard
      width={320}
      position="right-start"
      withArrow
      openDelay={80}
      closeDelay={120}
      shadow="md"
    >
      <HoverCard.Target>
        <UnstyledButton className={classes.navItem}>
          <Keyboard size={18} />
        </UnstyledButton>
      </HoverCard.Target>
      <HoverCard.Dropdown className={classes.shortcutsDropdown}>
        {content}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
