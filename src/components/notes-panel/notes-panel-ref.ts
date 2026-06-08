// Module-level ref so use-root-shortcuts can focus the panel without prop drilling
export const notesPanelRef: { current: HTMLTextAreaElement | null } = {
  current: null,
};
