import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  title: string;
  hint: string;
  buttonLabel: string;
  onButtonClick: () => void;
};

export const TimelineSectionHeader = ({
  title,
  hint,
  buttonLabel,
  onButtonClick,
}: Props) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-wider uppercase">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        {buttonLabel && (
          <Button size="xs" variant="outline" onClick={onButtonClick}>
            <Plus data-icon="inline-start" />
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
