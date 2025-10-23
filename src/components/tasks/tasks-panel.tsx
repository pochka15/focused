import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasksStore } from "@/domain/stores/tasks-store";
import { Plus } from "lucide-react";
import { useState, type FC } from "react";
import { TaskGroup } from "./task-group";

export const TasksPanel: FC<{ className?: string }> = ({ className }) => {
  const groups = useTasksStore((s) => s.groups);
  const addGroup = useTasksStore((s) => s.addGroup);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddGroup();
  };

  return (
    <div className={className}>
      <div className="flex gap-2 mb-6">
        <Input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add a new group (e.g., Work, Career)..."
          className="flex-1"
        />
        <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>
          <Plus className="w-4 h-4" />
          Add Group
        </Button>
      </div>

      <div className="space-y-6">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No task groups yet</p>
            <p>Create your first group to get started!</p>
          </div>
        ) : (
          groups.map((group) => <TaskGroup key={group.id} group={group} />)
        )}
      </div>
    </div>
  );
};
