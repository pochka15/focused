import { CanvasBoard } from "@/components/canvas-board";
import { CommandLine } from "@/components/command-line";
import { Help } from "@/components/help";
import { ThemeProvider } from "@/components/theme-provider";
import { RootController } from "@/lib/shortcuts/root-controller";
import { NotesPanel } from "@/shared-lib/notes-panel";
import { ShortcutsProvider } from "@/shared-lib/shortcuts/shortcuts-provider";
import { Stats } from "./components/stats";
import "./index.css";
import { NotificationsPanel } from "./components/notifications-panel";
import { Toaster } from "./components/ui/sonner";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ShortcutsProvider>
        <RootController>
          <CanvasBoard />
          <CommandLine />
          <Help />
          <Stats />
          <NotesPanel />
          <NotificationsPanel />
        </RootController>
        <Toaster />
      </ShortcutsProvider>
    </ThemeProvider>
  );
}

export default App;
