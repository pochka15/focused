import { AI_SETUP_PROMPT } from "@/lib/random/prompts";
import { Button, Code, Group, Stack, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useState } from "react";

function AiSetupView() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(AI_SETUP_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>AI Setup Prompt</Title>
        <Button
          size="xs"
          variant="light"
          leftSection={<Copy size={14} />}
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </Group>
      <Code block style={{ whiteSpace: "pre-wrap" }}>
        {AI_SETUP_PROMPT}
      </Code>
    </Stack>
  );
}

export const Route = createFileRoute("/ai-setup")({
  component: AiSetupView,
});
