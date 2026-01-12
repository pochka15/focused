import { CommandLine } from "@/components/command-line";
import { Help } from "@/components/help";
import { MainPanel } from "@/components/main-panel";
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
          <div className="bg-background text-foreground min-h-screen p-4">
            <MainPanel />
            <CommandLine />
            <Help />
            <Stats />
          </div>
        </RootNuphy>
      </NuphyProvider>
    </ThemeProvider>
  );
}

export default App;
