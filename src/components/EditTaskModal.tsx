import { useState } from "react";
import { FiX, FiSave, FiClock, FiPlus, FiCheck } from "react-icons/fi";
import type { TodoItem, SubTask } from "../types/types";

interface EditTaskModalProps {
  todo: TodoItem;
  onSave: (updatedTodo: TodoItem) => void;
  onCancel: () => void;
}

const EditTaskModal = ({ todo, onSave, onCancel }: EditTaskModalProps) => {
  const [editedTodo, setEditedTodo] = useState<TodoItem>({ ...todo });
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  const handleChange = (field: keyof TodoItem, value: any) => {
    setEditedTodo({ ...editedTodo, [field]: value });
  };

  const addReminderTime = () => {
    if (!newReminderTime) return;
    const currentReminders = editedTodo.reminderTimes || [];
    setEditedTodo({
      ...editedTodo,
      reminderTimes: [...currentReminders, newReminderTime],
    });
    setNewReminderTime("");
  };

  const removeReminderTime = (time: string) => {
    setEditedTodo({
      ...editedTodo,
      reminderTimes: (editedTodo.reminderTimes || []).filter((t) => t !== time),
    });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const currentSubtasks = editedTodo.subtasks || [];
    setEditedTodo({
      ...editedTodo,
      subtasks: [
        ...currentSubtasks,
        { id: Date.now().toString(), text: newSubtask.trim(), done: false },
      ],
    });
    setNewSubtask("");
  };

  const removeSubtask = (id: string) => {
    setEditedTodo({
      ...editedTodo,
      subtasks: (editedTodo.subtasks || []).filter((st) => st.id !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-fadeInScale">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-bold text-gray-800">Edit Task</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Task Name *
            </label>
            <input
              type="text"
              value={editedTodo.text}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Task name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedTodo.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Add details..."
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={editedTodo.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Work"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={editedTodo.priority || "medium"}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={editedTodo.dueDate || ""}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Reminder Times */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              <FiClock className="inline mr-1" />
              Reminder Times
            </label>
            <div className="space-y-2">
              {(editedTodo.reminderTimes || []).map((time, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50 rounded text-xs">
                  <FiClock className="text-indigo-600 flex-shrink-0" />
                  <span className="flex-grow text-gray-700">
                    {new Date(time).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => removeReminderTime(time)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="flex-grow px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addReminderTime}
                  disabled={!newReminderTime}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>

          {/* Habit Toggle */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-gray-700">Mark as Habit</p>
              <p className="text-xs text-gray-500">Track recurring activities</p>
            </div>
            <button
              onClick={() => handleChange("isHabit", !editedTodo.isHabit)}
              className={`w-11 h-6 rounded-full transition relative ${
                editedTodo.isHabit ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  editedTodo.isHabit ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Habit Frequency */}
          {editedTodo.isHabit && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["daily", "weekly", "monthly"] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleChange("habitFrequency", freq)}
                    className={`py-2 rounded-lg text-xs font-medium transition ${
                      editedTodo.habitFrequency === freq
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subtasks
            </label>
            <div className="space-y-2">
              {(editedTodo.subtasks || []).map((st) => (
                <div key={st.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <FiCheck className="text-gray-400 flex-shrink-0" />
                  <span className="flex-grow break-words">{st.text}</span>
                  <button
                    onClick={() => removeSubtask(st.id)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSubtask()}
                  className="flex-grow px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addSubtask}
                  disabled={!newSubtask.trim()}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition disabled:opacity-50"
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedTodo)}
            disabled={!editedTodo.text.trim()}
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiSave /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
