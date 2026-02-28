import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/random/utils";
import {
  getDefaultNotificationRow,
  getDefaultNotifications,
  notificationsSchema,
  toNewNotification,
} from "@/lib/schemas/notifications-schema";
import { useNotificationsStore } from "@/lib/stores/notifications-store";
import { useShortcutsMode } from "@/shared-lib/shortcuts/shortcuts-store";
import { useShortcuts } from "@/shared-lib/shortcuts/use-shortcuts";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, type KeyboardEvent } from "react";

export const NotificationsPanel = () => {
  const { enabled } = useShortcutsMode("editingNotifications");
  const notifications = useNotificationsStore((it) => it.notifications);
  const addNotification = useNotificationsStore((it) => it.addNotification);
  const editNotification = useNotificationsStore((it) => it.editNotification);
  const bulkDeleteNotifications = useNotificationsStore((it) => it.bulkDelete);

  const form = useForm({
    defaultValues: getDefaultNotifications(notifications),
    validators: { onChange: notificationsSchema },
    onSubmit: ({ value }) => {
      const rowIds = new Set(value.rows.map((row) => row.id).filter(Boolean));
      const idsToDelete = notifications
        .map((n) => n.id)
        .filter((id) => !rowIds.has(id));

      value.rows.forEach((row) => {
        if (row.id) editNotification({ id: row.id, ...toNewNotification(row) });
        else addNotification(toNewNotification(row));
      });

      if (idsToDelete.length > 0) {
        bulkDeleteNotifications(idsToDelete);
      }

      form.reset();
      disableModes(["editingNotifications"]);
    },
  });

  const firstFieldRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      form.pushFieldValue("rows", getDefaultNotificationRow());
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  };

  const { disableModes } = useShortcuts({
    name: "notificationsPanel",
    enabled,
    keys: (key, event) => {
      if (key === "Escape") {
        form.handleSubmit();
        disableModes(["editingNotifications"]);
        return true;
      }

      if (key === "Enter") {
        event.preventDefault();
        form.handleSubmit();
        return true;
      }

      return true;
    },
  });

  return (
    <form
      className={cn("flex max-w-5xl flex-col gap-4 p-4", !enabled && "hidden")}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="rows"
        mode="array"
        children={(rowsField) => (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Button
                type="button"
                onClick={() => {
                  rowsField.pushValue(getDefaultNotificationRow());
                }}
                size="sm"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Notification
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">
                        Time (HH:MM)
                      </th>
                      <th className="p-2 text-left font-medium">
                        Repeats (min)
                      </th>
                      <th className="p-2 text-left font-medium">Complete</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsField.state.value.map((_, rowIndex: number) => {
                      const isLastRow =
                        rowIndex === rowsField.state.value.length - 1;
                      return (
                        <tr
                          key={rowIndex}
                          className="border-b last-of-type:border-none"
                        >
                          <td className="p-2">
                            <form.Field
                              name={`rows[${rowIndex}].notificationName`}
                              children={(field) => (
                                <Input
                                  ref={isLastRow ? firstFieldRef : undefined}
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  className="h-8"
                                />
                              )}
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <form.Field
                                name={`rows[${rowIndex}].timeH`}
                                children={(field) => (
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="h-8 w-16"
                                    placeholder="HH"
                                  />
                                )}
                              />
                              <span className="flex items-center">:</span>
                              <form.Field
                                name={`rows[${rowIndex}].timeM`}
                                children={(field) => (
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="h-8 w-16"
                                    placeholder="MM"
                                  />
                                )}
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <form.Field
                              name={`rows[${rowIndex}].repeatsInMinutes`}
                              children={(field) => (
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  type="number"
                                  min="0"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="h-8"
                                />
                              )}
                            />
                          </td>
                          <td className="p-2">
                            <form.Field
                              name={`rows[${rowIndex}].isComplete`}
                              children={(field) => (
                                <input
                                  id={field.name}
                                  name={field.name}
                                  type="checkbox"
                                  checked={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.checked)
                                  }
                                  className="h-4 w-4"
                                />
                              )}
                            />
                          </td>
                          <td className="p-2">
                            <form.Field
                              name={`rows[${rowIndex}].notificationDescription`}
                              children={(field) => (
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    isLastRow && handleKeyDown(e)
                                  }
                                  className="h-8"
                                />
                              )}
                            />
                          </td>
                          <td>
                            <Button
                              type="button"
                              onClick={() => rowsField.removeValue(rowIndex)}
                              size="sm"
                              variant="ghost"
                              disabled={rowsField.state.value.length === 1}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      />
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
