import {
  buildPlanningContext,
  buildPlanningPrompt,
  type PlanningPromptValues,
} from "@/lib/random/prompts";
import { formatBacklogTask } from "@/lib/stores/planning-store";
import { usePlanningStore } from "@/lib/stores/planning-store";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import {
  Button,
  Group,
  Modal,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const timeBlockOptions = [
  { label: "1h", value: "1h" },
  { label: "2h", value: "2h" },
  { label: "3h", value: "3h" },
  { label: "Half-day", value: "half-day" },
];

const brainFuelOptions = [
  { label: "Low", value: "low" },
  { label: "Med", value: "med" },
  { label: "Full", value: "full" },
];

const aiModeOptions = [
  { label: "Democratic", value: "democratic" },
  { label: "Dictatorship", value: "dictatorship" },
];

export function PlanningForm({ opened, onClose }: Props) {
  const items = useTimelineStore((s) => s.items);
  const goal = usePlanningStore((s) => s.goal);
  const setGoal = usePlanningStore((s) => s.setGoal);
  const tasks = usePlanningStore((s) => s.tasks);

  const [timeBlock, setTimeBlock] =
    useState<PlanningPromptValues["timeBlock"]>("2h");
  const [brainFuel, setBrainFuel] =
    useState<PlanningPromptValues["brainFuel"]>("full");
  const [aiMode, setAiMode] =
    useState<PlanningPromptValues["aiMode"]>("democratic");
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const context = buildPlanningContext(items);
    const backlog = tasks.map(formatBacklogTask).join("\n\n");
    const prompt = buildPlanningPrompt(
      { timeBlock, brainFuel, note, goal, aiMode },
      context,
      backlog
    );
    navigator.clipboard.writeText(prompt).catch(() => {});
    onClose();
  };

  useShortcuts({
    name: "planningSession",
    enabled: opened,
    keys: (key, event) => {
      if (key === "Escape") {
        onClose();
        return true;
      }
      if (key === "Enter") {
        event.preventDefault();
        handleSubmit();
        return true;
      }
      return true;
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Plan with AI" size="sm">
      <Stack gap="sm">
        <div>
          <Text size="sm" mb={4}>
            Time block
          </Text>
          <SegmentedControl
            fullWidth
            data={timeBlockOptions}
            value={timeBlock}
            onChange={(v) =>
              setTimeBlock(v as PlanningPromptValues["timeBlock"])
            }
          />
        </div>

        <div>
          <Text size="sm" mb={4}>
            Brain fuel
          </Text>
          <SegmentedControl
            fullWidth
            data={brainFuelOptions}
            value={brainFuel}
            onChange={(v) =>
              setBrainFuel(v as PlanningPromptValues["brainFuel"])
            }
          />
        </div>

        <div>
          <Text size="sm" mb={4}>
            AI mode
          </Text>
          <SegmentedControl
            fullWidth
            data={aiModeOptions}
            value={aiMode}
            onChange={(v) => setAiMode(v as PlanningPromptValues["aiMode"])}
          />
        </div>

        <TextInput
          label={<Text size="sm">Note for AI (optional)</Text>}
          placeholder="e.g. finishing in 2h, skip deep tasks"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <TextInput
          label={<Text size="sm">Goal (optional)</Text>}
          placeholder="What do you want to achieve?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Copy prompt</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
