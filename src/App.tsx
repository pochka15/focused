import { CanvasBoard } from "@/components/canvas-board";
import { CommandLine } from "@/components/command-line";
import { Help } from "@/components/help";
import { ThemeProvider } from "@/components/theme-provider";
import { NuphyProvider } from "@/lib/nuphy/nuphy-provider";
import { Stats } from "./components/stats";
import "./index.css";
import { RootNuphy } from "./lib/nuphy/root-nuphy";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NuphyProvider>
        <RootNuphy>
          <CanvasBoard />
          <CommandLine />
          <Help />
          <Stats />
        </RootNuphy>
      </NuphyProvider>
    </ThemeProvider>
  );
}

export default App;
