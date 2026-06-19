import { Button, Group, Text, Title } from "@mantine/core";
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
    <Group justify="space-between" mb="md">
      <Title order={3}>{title}</Title>
      <Group gap="xs">
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<Plus size={14} />}
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </Group>
    </Group>
  );
};
