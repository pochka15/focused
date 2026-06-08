export type UiWindow = {
  cursor: number;
  size: number;
};

export type UiWindow2D<G extends number = number> = {
  groups: G[];
  focusedGroup: G;
  windows: Record<G, UiWindow>;
};

const withinBounds = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export const Window = {
  create: (cursor = 0, size = 1): UiWindow => ({ cursor, size }),
  withCursor: (w: UiWindow, cursor: number): UiWindow => ({ ...w, cursor }),
  first: (w: UiWindow): UiWindow => ({ ...w, cursor: 0 }),
  last: (w: UiWindow, elementsSize: number): UiWindow => ({
    ...w,
    cursor: Math.max(0, elementsSize - 1),
  }),
  shrinkTo: (w: UiWindow, max: number): UiWindow => {
    if (max <= 0) return { cursor: 0, size: 1 };
    const cursor = withinBounds(w.cursor, 0, max - 1);
    return {
      cursor,
      size: withinBounds(w.size, 1, max - cursor),
    };
  },
  move: (w: UiWindow, delta: number, elementsSize: number): UiWindow => ({
    cursor: withinBounds(w.cursor + delta, 0, Math.max(0, elementsSize - 1)),
    size: w.size,
  }),
  moveSingle: (w: UiWindow, delta: number, elementsSize: number): UiWindow => ({
    ...Window.move(w, delta, elementsSize),
    size: 1,
  }),
};

export const Window2D = {
  create: <G extends number>(
    groups: readonly G[],
    initialWindow: UiWindow = Window.create()
  ): UiWindow2D<G> => {
    if (groups.length === 0) {
      throw new Error("Window2D.create requires at least one group");
    }

    const windows = Object.fromEntries(
      groups.map((group) => [group, { ...initialWindow }])
    ) as Record<G, UiWindow>;

    return {
      groups: [...groups],
      focusedGroup: groups[0]!,
      windows,
    };
  },
  setFocusedGroup: <G extends number>(
    state: UiWindow2D<G>,
    focusedGroup: G
  ): UiWindow2D<G> => ({ ...state, focusedGroup }),
  cycleFocusedGroup: <G extends number>(
    state: UiWindow2D<G>,
    direction: 1 | -1
  ): UiWindow2D<G> => {
    const idx = state.groups.indexOf(state.focusedGroup);
    const nextIdx =
      idx < 0
        ? 0
        : (idx + direction + state.groups.length) % state.groups.length;
    return {
      ...state,
      focusedGroup: state.groups[nextIdx] ?? state.focusedGroup,
    };
  },
  updateWindow: <G extends number>(
    state: UiWindow2D<G>,
    group: G,
    updater: (window: UiWindow) => UiWindow
  ): UiWindow2D<G> => ({
    ...state,
    windows: {
      ...state.windows,
      [group]: updater(state.windows[group] ?? Window.create()),
    },
  }),
  shrinkAllTo: <G extends number>(
    state: UiWindow2D<G>,
    sizes: Record<G, number>
  ): UiWindow2D<G> => ({
    ...state,
    windows: Object.fromEntries(
      state.groups.map((group) => [
        group,
        Window.shrinkTo(
          state.windows[group] ?? Window.create(),
          sizes[group] ?? 0
        ),
      ])
    ) as Record<G, UiWindow>,
  }),
};
