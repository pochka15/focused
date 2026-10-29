import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RootController } from "@/lib/shortcuts/root-controller";
import { cn, tw } from "@/lib/utils";
import { useBacklogStore } from "@/lib/stores/backlog-store";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import type { FileRouteTypes } from "@/routeTree.gen";
import { ShortcutsProvider } from "@/shared-lib/shortcuts/shortcuts-provider";
import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { ShortcutsHover } from "../components/shell/shortcuts-hover.tsx";
import { resetNotificationTimes } from "@/lib/notifications/notifications-utils.ts";

type FullPath = FileRouteTypes["fullPaths"];

const navbarStyles = tw`
  fixed inset-y-0 left-0 z-20 hidden w-12 flex-col items-center
  justify-between bg-sidebar py-2 sm:flex
`;

const NavItem = ({
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
}) => {
  const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={active ? "secondary" : "ghost"}
            size="icon-sm"
            className={cn(!active && "text-muted-foreground")}
            onClick={() => onNavigate(to)}
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent side="right">
        {label}
        {shortcut && <span className="font-mono opacity-60">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={toggleTheme}
          />
        }
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </TooltipTrigger>
      <TooltipContent side="right">
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </TooltipContent>
    </Tooltip>
  );
};

const NewDayButton = () => {
  const clearTimelineItems = useTimelineStore((s) => s.clearItems);
  const notifications = useNotificationsStore((s) => s.notifications);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const tasks = useBacklogStore((s) => s.tasks);
  const removeTask = useBacklogStore((s) => s.removeTask);

  const startNewDay = () => {
    clearTimelineItems();
    setNotifications(resetNotificationTimes(notifications));
    tasks.filter((t) => t.isDone).forEach((task) => removeTask(task.id));
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={startNewDay}
          />
        }
      >
        <CalendarPlus />
      </TooltipTrigger>
      <TooltipContent side="right">
        New day
        <span className="opacity-60"> · clears done items, resets times</span>
      </TooltipContent>
    </Tooltip>
  );
};

const NavbarContents = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const go = (to: FullPath) => void navigate({ to });

  return (
    <nav className={navbarStyles}>
      <div className="flex flex-col items-center gap-1">
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
        <ShortcutsHover pathname={pathname} />
      </div>

      <div className="flex flex-col items-center gap-1">
        <NewDayButton />
        <ThemeToggle />
      </div>
    </nav>
  );
};

const RootLayout = () => (
  <ThemeProvider defaultTheme="dark">
    <TooltipProvider delay={300}>
      <Toaster position="bottom-right" offset={{ left: 64 }} />
      <ShortcutsProvider>
        <RootController>
          <NavbarContents />
          <main className="min-h-svh p-4 sm:pl-16">
            <Outlet />
          </main>
        </RootController>
      </ShortcutsProvider>
    </TooltipProvider>
  </ThemeProvider>
);

export const Route = createRootRoute({
  component: RootLayout,
});
