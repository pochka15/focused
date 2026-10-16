import { ChevronDown } from "lucide-react";

type Props = {
  count: number;
  onClick: () => void;
};

export const CollapsedMilestonesCard = ({ count, onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
    >
      <ChevronDown className="size-3.5" />
      <span className="font-mono">{count}</span> completed
    </button>
  );
};
