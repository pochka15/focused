import { CanvasBoard } from "@/components/canvas-board";
import { CommandLine } from "@/components/command-line";
import { Help } from "@/components/help";
import { ThemeProvider } from "@/components/theme-provider";
import { RootShortcuts } from "@/lib/shortcuts/root-shortcuts";
import { NotesPanel } from "@/shared-lib/notes-panel";
import { ShortcutsProvider } from "@/shared-lib/shortcuts/shortcuts-provider";
import { Stats } from "./components/stats";
import "./index.css";
import { NotificationsPanel } from "./components/notifications-panel";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ShortcutsProvider>
        <RootShortcuts>
          <CanvasBoard />
          <CommandLine />
          <Help />
          <Stats />
          <NotesPanel />
          <NotificationsPanel />
        </RootShortcuts>
      </ShortcutsProvider>
    </ThemeProvider>
  );
}

export default App;
