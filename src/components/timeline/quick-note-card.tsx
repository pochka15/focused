import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  textareaRef: (el: HTMLTextAreaElement | null) => void;
};

export const QuickNoteCard = ({ value, onChange, textareaRef }: Props) => {
  return (
    <div className="bg-muted/40 px-4 py-1">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder="Quick note..."
        className="max-h-[150px] min-h-14 overflow-y-auto border-b-transparent"
      />
    </div>
  );
};
