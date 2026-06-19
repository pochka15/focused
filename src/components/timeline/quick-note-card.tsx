import { Card, Textarea } from "@mantine/core";
import classes from "./timeline-view.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  textareaRef: (el: HTMLTextAreaElement | null) => void;
};

export const QuickNoteCard = ({ value, onChange, textareaRef }: Props) => {
  return (
    <Card withBorder padding="xs" className={classes.quickNoteCard}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder="Quick note..."
        autosize
        minRows={2}
        maxRows={6}
        classNames={{ input: classes.quickNoteInput }}
      />
    </Card>
  );
};
