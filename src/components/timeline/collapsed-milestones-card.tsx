import { Card, Text } from "@mantine/core";
import { ChevronDown } from "lucide-react";

type Props = {
  count: number;
  onClick: () => void;
};

export const CollapsedMilestonesCard = ({ count, onClick }: Props) => {
  return (
    <Card onClick={onClick} style={{ cursor: "pointer", padding: 0 }}>
      <Text size="sm" c="dimmed" fw={500}>
        <ChevronDown size={14} style={{ display: "inline", marginRight: 4 }} />
        {count} completed
      </Text>
    </Card>
  );
};
