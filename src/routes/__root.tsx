import { PlanningForm } from "@/components/planning/planning-form";
import { NotesPanel } from "@/components/notes-panel/notes-panel";
import { RootController } from "@/lib/shortcuts/root-controller";
import { ShortcutsProvider } from "@/shared-lib/shortcuts/shortcuts-provider";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  AppShell,
  MantineProvider,
  Stack,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useMantineColorScheme } from "@mantine/core";
import type { FileRouteTypes } from "@/routeTree.gen";
import {
  Bell,
  BrainCircuit,
  Bot,
  CalendarDays,
  ClipboardList,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import classes from "./__root.module.css";

type FullPath = FileRouteTypes["fullPaths"];

function NavItem({
  to,
  icon: Icon,
  label,
  shortcut,
  pathname,
  onNavigate,
}: {
  to: FullPath;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  pathname: string;
  onNavigate: (to: FullPath) => void;
}) {
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Tooltip
      label={shortcut ? `${label} (${shortcut})` : label}
      position="right"
      withArrow
    >
      <UnstyledButton
        className={active ? classes.navItemActive : classes.navItem}
        onClick={() => onNavigate(to)}
      >
        <Icon size={18} />
      </UnstyledButton>
    </Tooltip>
  );
}

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Tooltip
      label={colorScheme === "dark" ? "Light mode" : "Dark mode"}
      position="right"
      withArrow
    >
      <UnstyledButton className={classes.navItem} onClick={toggleColorScheme}>
        {colorScheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </UnstyledButton>
    </Tooltip>
  );
}

function NavbarContents() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [planningOpen, setPlanningOpen] = useState(false);
  const go = (to: FullPath) => void navigate({ to });

  return (
    <>
      <PlanningForm
        opened={planningOpen}
        onClose={() => setPlanningOpen(false)}
      />
      <Stack gap={4} p={6} h="100%" justify="space-between" align="center">
        <Stack gap={4} align="center">
          <NavItem
            to="/"
            icon={CalendarDays}
            label="Timeline"
            shortcut="t"
            pathname={pathname}
            onNavigate={go}
          />
          <NavItem
            to="/backlog"
            icon={ClipboardList}
            label="Backlog"
            shortcut="b"
            pathname={pathname}
            onNavigate={go}
          />
          <NavItem
            to="/notifications"
            icon={Bell}
            label="Notifications"
            shortcut="r"
            pathname={pathname}
            onNavigate={go}
          />
          <NavItem
            to="/ai-setup"
            icon={Bot}
            label="AI Setup"
            pathname={pathname}
            onNavigate={go}
          />
        </Stack>

        <Stack gap={4} align="center" pb={6}>
          <Tooltip label="Plan with AI" position="right" withArrow>
            <UnstyledButton
              className={classes.navItem}
              onClick={() => setPlanningOpen(true)}
            >
              <BrainCircuit size={18} />
            </UnstyledButton>
          </Tooltip>
          <ThemeToggle />
        </Stack>
      </Stack>
    </>
  );
}

function RootLayout() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <ModalsProvider>
        <Notifications />
        <ShortcutsProvider>
          <RootController>
            <AppShell
              navbar={{ width: 48, breakpoint: "sm" }}
              footer={{ height: "auto" }}
              padding="md"
            >
              <AppShell.Navbar>
                <NavbarContents />
              </AppShell.Navbar>
              <AppShell.Main>
                <Outlet />
              </AppShell.Main>
              <AppShell.Footer className={classes.notesFooter}>
                <NotesPanel />
              </AppShell.Footer>
            </AppShell>
          </RootController>
        </ShortcutsProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
