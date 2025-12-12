import { useNuphy } from "@/lib/nuphy/nuphy-provider";
import { cn } from "@/lib/random/utils";
import { useEffect, useRef, useState } from "react";

interface CommandLineProps {
  className?: string;
}

export const CommandLine = ({ className }: CommandLineProps) => {
  const [command, setCommand] = useState({ ready: false, value: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    switch (command.value) {
      case "help":
        sendEvent({ name: "set-help", data: { isActive: true } });
        break;
      case "new":
        sendEvent({ name: "set-add-todo-mode", data: { isActive: true } });
        break;
    }
  };

  const { sendEvent, isActive } = useNuphy({
    name: "command",
    keyHandler: (key) => {
      if (key === "Escape") {
        sendEvent({ name: "set-command-mode", data: { isActive: false } });
      } else if (key === "Enter") {
        sendEvent({ name: "set-command-mode", data: { isActive: false } });
        submit();
      }
      return true;
    },
  });

  // Focus the input and clear command when entering command mode
  useEffect(() => {
    if (isActive) {
      setCommand({ ready: true, value: "" });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    setCommand({ ready: isActive, value: "" });
  }, [isActive]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (command.ready) setCommand({ ready: true, value: e.target.value });
  };

  return (
    <div
      className={cn(
        "bg-background border-border fixed right-0 bottom-0 left-0 z-50 border-t p-2",
        !isActive && "hidden",
        className
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={command.value}
        onChange={handleInputChange}
        className="text-foreground max-w-full flex-1 border-none bg-transparent font-mono text-sm outline-none"
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};
