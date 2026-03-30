import { CanvasBoard } from "@/components/canvas-board";
import { CommandLine } from "@/components/command-line";
import { Help } from "@/components/help";
import { KeystrokesDisplay } from "@/components/keystrokes-display";
import { ThemeProvider } from "@/components/theme-provider";
import { RootController } from "@/lib/shortcuts/root-controller";
import { NotesPanel } from "@/shared-lib/notes-panel";
import { ShortcutsProvider } from "@/shared-lib/shortcuts/shortcuts-provider";
import { NotificationsPanel } from "./components/notifications-panel";
import { Stats } from "./components/stats";
import { Toaster } from "./components/ui/sonner";
import "./index.css";

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
          <KeystrokesDisplay />
        </RootController>
        <Toaster />
      </ShortcutsProvider>
    </ThemeProvider>
  );
}

export default App;
