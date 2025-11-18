import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import type { SubTask } from "../types/types";
import { FiArrowLeft, FiPlus, FiX, FiCheck, FiClock } from "react-icons/fi";
import Footer from "../components/Footer";
import TodoService from "../services/todoService";
import NotificationService from "../services/notificationService";

const Todo = () => {
  const navigate = useNavigate();
  const loggedUser = JSON.parse(Cookies.get("loggedInUser") || "{}");
  const userId = loggedUser.email;

  const [newTodo, setNewTodo] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminderTimes, setReminderTimes] = useState<string[]>([]);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [isHabit, setIsHabit] = useState(false);
  const [habitFrequency, setHabitFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  useEffect(() => {
    // Load categories from CategoryService
    const loadCategories = async () => {
      const { default: CategoryService } = await import('../services/categoryService');
      const unsubscribe = CategoryService.subscribeCategories(userId, (cats) => {
        setExistingCategories(cats);
      });
      return unsubscribe;
    };
    
    let unsubscribe: (() => void) | undefined;
    loadCategories().then(unsub => { unsubscribe = unsub; });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtask.trim(), done: false }]);
    setNewSubtask("");
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const addReminderTime = () => {
    if (!newReminderTime) return;
    setReminderTimes([...reminderTimes, newReminderTime]);
    setNewReminderTime("");
  };

  const removeReminderTime = (time: string) => {
    setReminderTimes(reminderTimes.filter(t => t !== time));
  };

  const handleCategorySelect = (cat: string) => {
    if (cat === "custom") {
      setShowCustomCategory(true);
      setCategory("");
    } else {
      setCategory(cat);
      setShowCustomCategory(false);
    }
  };

  const handleAddTodo = async () => {
    const trimmedText = newTodo.trim();
    if (!trimmedText) {
      alert("Please enter a task name");
      return;
    }
    if (trimmedText.length > 100) {
      alert("Task should not exceed 100 characters.");
      return;
    }

    console.log("Starting to add todo...");
    const finalCategory = showCustomCategory ? customCategory.trim() : category;

    try {
      // Save custom category if it's new
      if (finalCategory && !existingCategories.includes(finalCategory)) {
        try {
          console.log("Saving new category:", finalCategory);
          const { default: CategoryService } = await import('../services/categoryService');
          await CategoryService.addCategory(userId, finalCategory);
        } catch (catError) {
          console.error("Error saving category:", catError);
          // Continue even if category save fails
        }
      }

      const additionalData: any = {};
      
      if (finalCategory) additionalData.category = finalCategory;
      if (priority) additionalData.priority = priority;
      if (dueDate) additionalData.dueDate = dueDate;
      if (reminderTimes.length > 0) additionalData.reminderTimes = reminderTimes;
      if (isHabit) {
        additionalData.isHabit = true;
        additionalData.habitFrequency = habitFrequency;
      }
      if (subtasks.length > 0) additionalData.subtasks = subtasks;

      console.log("Adding todo with data:", { text: trimmedText, additionalData });
      await TodoService.addTodo(userId, trimmedText, newDescription.trim(), additionalData);
      
      console.log("Todo added successfully");
      await NotificationService.sendImmediateNotification(
        "✅ Task Added",
        `"${trimmedText}" has been added`
      );

      navigate("/home");
    } catch (error: any) {
      console.error("Full error adding todo:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      alert(`Failed to add task: ${error.message || 'Please check console for details'}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-grow flex justify-center items-start px-4 py-6">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
          {/* Header - Fixed */}
          <div className="flex items-center gap-3 p-4 border-b flex-shrink-0">
            <button
              onClick={() => navigate("/home")}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-xl font-bold text-indigo-600">Add New Task</h1>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {/* Task Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Task Name *</label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">{newTodo.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Add details..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {existingCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      category === cat && !showCustomCategory
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => handleCategorySelect("custom")}
                  className={`px-3 py-1 rounded-full text-xs transition ${
                    showCustomCategory
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  + Custom
                </button>
              </div>
              {showCustomCategory && (
                <input
                  type="text"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg text-xs font-medium transition ${
                      priority === p
                        ? p === "high"
                          ? "bg-red-500 text-white"
                          : p === "medium"
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Reminder Times */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <FiClock className="inline mr-1" />
                Reminder Times
              </label>
              <div className="space-y-2">
                {reminderTimes.map((time, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50 rounded text-xs">
                    <FiClock className="text-indigo-600" />
                    <span className="flex-grow text-gray-700">
                      {new Date(time).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <button onClick={() => removeReminderTime(time)} className="text-red-500 hover:text-red-700">
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
                    className="flex-grow px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addReminderTime}
                    disabled={!newReminderTime}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>

            {/* Habit Toggle */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-700">Mark as Habit</p>
                <p className="text-xs text-gray-500">Track recurring activities</p>
              </div>
              <button
                onClick={() => setIsHabit(!isHabit)}
                className={`w-11 h-6 rounded-full transition relative ${
                  isHabit ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                    isHabit ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Habit Frequency */}
            {isHabit && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekly", "monthly"] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setHabitFrequency(freq)}
                      className={`py-2 rounded-lg text-xs font-medium transition ${
                        habitFrequency === freq
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Subtasks</label>
              <div className="space-y-2">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                    <FiCheck className="text-gray-400 flex-shrink-0" />
                    <span className="flex-grow break-words">{st.text}</span>
                    <button onClick={() => removeSubtask(st.id)} className="text-red-500 hover:text-red-700 flex-shrink-0">
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
                    onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                    className="flex-grow px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition disabled:opacity-50"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed */}
          <div className="flex gap-2 p-4 border-t flex-shrink-0">
            <button
              onClick={() => navigate("/home")}
              className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTodo}
              disabled={!newTodo.trim()}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Todo;
