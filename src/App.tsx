import { FocusPanel } from "@/components/focus-panel";
import { TasksPanel } from "@/components/tasks/tasks-panel";
import { ThemeProvider } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import "./index.css";
import { useShortcuts } from "./lib/hooks/use-shortcuts";

export function App() {
  const [activeTab, setActiveTab] = useState("tab2");
  const switchTab = () =>
    setActiveTab((it) => (it === "tab1" ? "tab2" : "tab1"));

  useShortcuts({ "cmd+j": switchTab });

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground md:w-4/5 xl:w-1/2 mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tab1">Tasks</TabsTrigger>
            <TabsTrigger value="tab2">Focus</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <TasksPanel className="max-w-4xl" />
          </TabsContent>
          <TabsContent value="tab2">
            <FocusPanel className="max-w-4xl" onTabChange={switchTab} />
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}

export default App;
