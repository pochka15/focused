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
import { ChevronDown, ChevronUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { Button } from "./ui/button";

const NotificationsForm = () => {
  const notifications = useNotificationsStore((it) => it.notifications);
  const setNotifications = useNotificationsStore((it) => it.setNotifications);

  const form = useForm({
    defaultValues: getDefaultNotifications(notifications),
    validators: { onChange: notificationsSchema },
    onSubmit: ({ value }) => {
      const nextNotifications = value.rows.map((row) => ({
        id: row.id ?? crypto.randomUUID(),
        ...toNewNotification(row),
      }));

      setNotifications(nextNotifications);

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

  const moveRow = (index: number, direction: -1 | 1) => {
    const rows = form.getFieldValue("rows");
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= rows.length) {
      return;
    }

    const nextRows = [...rows];
    const currentRow = nextRows[index];
    const targetRow = nextRows[nextIndex];
    if (!currentRow || !targetRow) {
      return;
    }

    nextRows[index] = targetRow;
    nextRows[nextIndex] = currentRow;
    form.setFieldValue("rows", nextRows);
  };

  const hasRowErrors = (rowIndex: number) => {
    const fieldNames = [
      `rows[${rowIndex}].notificationName`,
      `rows[${rowIndex}].timeH`,
      `rows[${rowIndex}].timeM`,
      `rows[${rowIndex}].repeatsInMinutes`,
      `rows[${rowIndex}].isComplete`,
      `rows[${rowIndex}].notificationDescription`,
    ];

    return fieldNames.some((name) => {
      const fieldInfo = form.getFieldInfo(name as any);
      const errors = fieldInfo.instance?.state.meta.errors;
      return !!errors && errors.length > 0;
    });
  };

  const { disableModes } = useShortcuts({
    name: "notificationsPanel",
    enabled: true,
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
      className="flex max-w-5xl flex-col gap-4 p-4"
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
              <div className="flex items-center gap-2">
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
                <Button
                  type="button"
                  onClick={() => {
                    form.setFieldValue(
                      "rows",
                      form
                        .getFieldValue("rows")
                        .map((row) => ({
                          ...row,
                          isComplete: false,
                          timeH: 11,
                          timeM: 0,
                        }))
                    );
                  }}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="w-16 p-2 text-left font-medium">Move</th>
                      <th className="p-2 text-left font-medium">Name</th>
                      <th className="p-2 text-left font-medium">
                        Time (HH:MM)
                      </th>
                      <th className="p-2 text-left font-medium">Repeats</th>
                      <th className="p-2 text-left font-medium">Complete</th>
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsField.state.value.map((_, rowIndex: number) => {
                      const isLastRow =
                        rowIndex === rowsField.state.value.length - 1;
                      const rowHasErrors = hasRowErrors(rowIndex);
                      return (
                        <tr
                          key={rowIndex}
                          className={cn(
                            "border-b last-of-type:border-none",
                            rowHasErrors && "bg-red-50/60 dark:bg-red-950/25"
                          )}
                        >
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                                disabled={rowIndex === 0}
                                onClick={() => moveRow(rowIndex, -1)}
                                aria-label="Move row up"
                              >
                                <ChevronUp className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="size-8 p-0"
                                disabled={
                                  rowIndex === rowsField.state.value.length - 1
                                }
                                onClick={() => moveRow(rowIndex, 1)}
                                aria-label="Move row down"
                              >
                                <ChevronDown className="size-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="p-2">
                            <form.Field
                              name={`rows[${rowIndex}].notificationName`}
                              children={(field) => (
                                <Input
                                  autoComplete="off"
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
                                    autoComplete="off"
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
                                    autoComplete="off"
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
                                  autoComplete="off"
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  placeholder="e.g. 1h 20m"
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
                                  autoComplete="off"
                                  id={field.name}
                                  name={field.name}
                                  type="checkbox"
                                  checked={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.checked)
                                  }
                                  className="size-4"
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

export const NotificationsPanel = () => {
  const { enabled } = useShortcutsMode("editingNotifications");
  if (!enabled) return null;
  return <NotificationsForm />;
};
