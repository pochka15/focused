import { Divider, HoverCard, Stack, Text, UnstyledButton } from "@mantine/core";
import { Keyboard } from "lucide-react";
import classes from "./__root.module.css";

const NAV_SHORTCUTS_SECTION = {
  title: "Navigation",
  items: ["t: timeline", "b: backlog", "r: notifications"],
};

const TIMELINE_SHORTCUTS_SECTION = {
  title: "Timeline",
  items: [
    "n: new milestone",
    "v: new event",
    "e: edit",
    "a: toggle done",
    "j/k: move cursor",
    "J/K: reorder",
    "cmd+k: quick note",
    "c: show/hide completed",
  ],
};

const BACKLOG_SHORTCUTS_SECTION = {
  title: "Backlog",
  items: [
    "q: mode switch",
    "n: new task",
    "e: edit",
    "p / shift+P: push timeline",
    "x: postpone",
    "z: snooze picker",
    "m: move task",
    "h/l or arrows: group nav",
    "j/k/g/G: task nav",
    "J/K: swap",
    "a: next-only",
  ],
};

const NOTIFICATIONS_SHORTCUTS_SECTION = {
  title: "Notifications",
  items: ["Open Notifications with r"],
};

const SHORTCUT_SECTIONS = [
  {
    route: "/",
    section: TIMELINE_SHORTCUTS_SECTION,
  },
  {
    route: "/backlog",
    section: BACKLOG_SHORTCUTS_SECTION,
  },
  {
    route: "/notifications",
    section: NOTIFICATIONS_SHORTCUTS_SECTION,
  },
];

type Props = {
  pathname: string;
};

export function ShortcutsHover({ pathname }: Props) {
  const routeSection =
    SHORTCUT_SECTIONS.find((item) =>
      item.route === "/" ? pathname === "/" : pathname.startsWith(item.route)
    )?.section ?? TIMELINE_SHORTCUTS_SECTION;

  const visibleSections = [NAV_SHORTCUTS_SECTION, routeSection];

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
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
