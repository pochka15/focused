export const BACKLOG_ROUTE_VIEW_PARAM = "view" as const;

export type BacklogRouteView = "tinder" | "grid";

export type BacklogRouteSearch = {
  view?: BacklogRouteView;
};

export const getBacklogRouteView = (
  search: BacklogRouteSearch | undefined
): BacklogRouteView => {
  return search?.[BACKLOG_ROUTE_VIEW_PARAM] === "grid" ? "grid" : "tinder";
};

export const getBacklogRouteSearch = (
  view: BacklogRouteView
): BacklogRouteSearch => {
  return view === "grid" ? { view } : {};
};
