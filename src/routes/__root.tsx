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
  CalendarDays,
  ClipboardList,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { ShortcutsHover } from "./shortcuts-hover";
import { StatsHover } from "./stats-hover.tsx";
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
  const go = (to: FullPath) => void navigate({ to });

  return (
    <>
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
          <StatsHover />
          <ShortcutsHover pathname={pathname} />
        </Stack>

        <Stack gap={4} align="center" pb={6}>
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
              navbar={{
                width: 48,
                breakpoint: "sm",
                collapsed: { mobile: true },
              }}
              padding="md"
            >
              <AppShell.Navbar>
                <NavbarContents />
              </AppShell.Navbar>
              <AppShell.Main>
                <Outlet />
              </AppShell.Main>
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
