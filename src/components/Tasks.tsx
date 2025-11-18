import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiEdit2, FiTrash2 } from "react-icons/fi";
import Cookies from "js-cookie";
import TodoService from "../services/todoService";
import NotificationService from "../services/notificationService";
import EditTaskModal from "./EditTaskModal";
import type { TodoItem } from "../types/types";

const Tasks = () => {
  const loggedUser = JSON.parse(Cookies.get("loggedInUser") || "{}");
  const userId = loggedUser.email;
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    const unsubscribe = TodoService.subscribeTodos(userId, (firebaseTodos) => {
      const mappedTodos = firebaseTodos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        done: todo.done,
        description: todo.description,
        category: todo.category,
        dueDate: todo.dueDate,
        priority: todo.priority,
        isHabit: todo.isHabit,
        reminderTimes: todo.reminderTimes,
        subtasks: todo.subtasks,
      }));
      setTodos(mappedTodos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || todo.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(todos.map((t) => t.category).filter(Boolean)))];

  const toggleTodo = async (todo: TodoItem) => {
    if (!todo.id) return;
    try {
      await TodoService.toggleTodoDone(todo.id, todo.done);
      await NotificationService.sendImmediateNotification(
        todo.done ? "🔄 Task Reopened" : "✅ Task Completed",
        `"${todo.text}"`
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const startEdit = (todo: TodoItem) => {
    setEditingTodo({ ...todo });
  };

  const saveEdit = async (updatedTodo: TodoItem) => {
    if (!updatedTodo?.id || !updatedTodo.text.trim()) return;
    try {
      // Save new category if it doesn't exist
      if (updatedTodo.category) {
        const { default: CategoryService } = await import('../services/categoryService');
        const existingCats = await CategoryService.getCategories(userId);
        if (!existingCats.includes(updatedTodo.category)) {
          await CategoryService.addCategory(userId, updatedTodo.category);
        }
      }

      const updates: any = {
        text: updatedTodo.text.trim(),
        description: updatedTodo.description,
        category: updatedTodo.category,
        priority: updatedTodo.priority,
        dueDate: updatedTodo.dueDate,
        reminderTimes: updatedTodo.reminderTimes,
        isHabit: updatedTodo.isHabit,
        habitFrequency: updatedTodo.habitFrequency,
        subtasks: updatedTodo.subtasks,
      };
      
      await TodoService.updateTodo(updatedTodo.id, updates);
      await NotificationService.sendImmediateNotification("✏️ Task Updated", `"${updatedTodo.text}"`);
      setEditingTodo(null);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (todo: TodoItem) => {
    if (!todo.id || !window.confirm("Delete this task?")) return;
    try {
      await TodoService.deleteTodo(todo.id);
      await NotificationService.sendImmediateNotification("🗑️ Task Deleted", `"${todo.text}"`);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Search */}
      <div className="relative flex-shrink-0">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide flex-shrink-0">
        <FiFilter className="text-gray-400 flex-shrink-0 text-sm" />
        {categories.map((cat) => (
          <button
            key={cat || 'all'}
            onClick={() => setFilterCategory(cat || 'all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition flex-shrink-0 ${
              filterCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTodo && (
        <EditTaskModal
          todo={editingTodo}
          onSave={saveEdit}
          onCancel={() => setEditingTodo(null)}
        />
      )}

      {/* Task List */}
      <div className="space-y-2 flex-grow overflow-y-auto pr-1 min-h-0">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks found</p>
            <p className="text-xs mt-1">Click the + button to add a task</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition p-3">
              <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodo(todo)}
                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <p className={`text-sm break-words ${todo.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {todo.text}
                    </p>
                    {todo.description && (
                      <p className="text-xs text-gray-500 mt-1 break-words">{todo.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {todo.category && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {todo.category}
                        </span>
                      )}
                      {todo.priority && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            todo.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : todo.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {todo.priority}
                        </span>
                      )}
                      {todo.dueDate && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {new Date(todo.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  export default Tasks;
