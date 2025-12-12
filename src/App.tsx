import { CommandLine } from "@/components/command-line";
import { MainPanel } from "@/components/main-panel";
import { ThemeProvider } from "@/components/theme-provider";
import { Help } from "./components/help";
import "./index.css";
import { NuphyProvider } from "./lib/nuphy/nuphy-provider";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NuphyProvider>
        <div className="bg-background text-foreground min-h-screen p-4">
          <MainPanel />
          <CommandLine />
          <Help />
        </div>
      </NuphyProvider>
    </ThemeProvider>
  );
}

export default App;
