export const BACKLOG_ROUTE_VIEW_PARAM = "view" as const;

export type BacklogRouteView = "zen" | "full";

export type BacklogRouteSearch = {
  view?: BacklogRouteView;
};

export const getBacklogRouteView = (
  search: BacklogRouteSearch | undefined
): BacklogRouteView => {
  return search?.[BACKLOG_ROUTE_VIEW_PARAM] === "full" ? "full" : "zen";
};

export const getBacklogRouteSearch = (
  view: BacklogRouteView
): BacklogRouteSearch => {
  return view === "full" ? { view } : {};
};
