export type Mode<T = unknown> = { enabled: boolean; data: T };

export type Modes = {
  help: Mode;
  syncing: Mode<{ lastUpdated: number }>;
  planningSession: Mode;
  editingMilestoneCardTasks: Mode<{ milestoneId: string; taskIndex: number }>;
};

export type ModeName = keyof Modes;

export const getDefaultModes = (): Modes => ({
  help: { enabled: false, data: {} },
  syncing: { enabled: false, data: { lastUpdated: 0 } },
  planningSession: { enabled: false, data: {} },
  editingMilestoneCardTasks: {
    enabled: false,
    data: { milestoneId: "", taskIndex: 0 },
  },
});
