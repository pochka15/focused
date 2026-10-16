import { toast, type ToasterProps } from "sonner";

export function showUndoNotification(
  id: string,
  message: string,
  onUndo: () => void,
  position: ToasterProps["position"] = "bottom-right"
) {
  toast(message, {
    id,
    duration: 5000,
    closeButton: true,
    position,
    action: {
      label: "Undo",
      onClick: () => onUndo(),
    },
  });
}
