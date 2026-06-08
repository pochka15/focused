export type Mode<T = unknown> = { enabled: boolean; data: T };

export type Modes = {
  syncing: Mode<{ lastUpdated: number }>;
  planningSession: Mode;
};

export type ModeName = keyof Modes;

export const getDefaultModes = (): Modes => ({
  syncing: { enabled: false, data: { lastUpdated: 0 } },
  planningSession: { enabled: false, data: {} },
});
