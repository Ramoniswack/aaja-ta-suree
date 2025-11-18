import { useState, useEffect } from "react";
import { FiTrendingUp, FiCheckCircle, FiClock, FiTarget } from "react-icons/fi";
import Cookies from "js-cookie";
import TodoService from "../services/todoService";
import type { TodoItem } from "../types/types";

const MyStats = () => {
  const loggedUser = JSON.parse(Cookies.get("loggedInUser") || "{}");
  const userId = loggedUser.email;
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    const unsubscribe = TodoService.subscribeTodos(userId, (firebaseTodos) => {
      const mappedTodos = firebaseTodos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        done: todo.done,
        category: todo.category,
        isHabit: todo.isHabit,
      }));
      setTodos(mappedTodos);
    });

    return () => unsubscribe();
  }, [userId]);

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryStats = todos.reduce((acc, todo) => {
    const cat = todo.category || "Uncategorized";
    if (!acc[cat]) {
      acc[cat] = { total: 0, completed: 0 };
    }
    acc[cat].total++;
    if (todo.done) acc[cat].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const habits = todos.filter((t) => t.isHabit);
  const completedHabits = habits.filter((h) => h.done).length;

  return (
    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-3 rounded-lg">
          <FiCheckCircle className="text-xl mb-1" />
          <p className="text-xl font-bold">{completedTasks}</p>
          <p className="text-xs opacity-90">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-3 rounded-lg">
          <FiClock className="text-xl mb-1" />
          <p className="text-xl font-bold">{pendingTasks}</p>
          <p className="text-xs opacity-90">Pending</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-lg">
          <FiTrendingUp className="text-xl mb-1" />
          <p className="text-xl font-bold">{completionRate}%</p>
          <p className="text-xs opacity-90">Completion</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-lg">
          <FiTarget className="text-xl mb-1" />
          <p className="text-xl font-bold">{completedHabits}/{habits.length}</p>
          <p className="text-xs opacity-90">Habits</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-2 text-gray-700">Category Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(categoryStats)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([category, stats]) => {
                const categoryRate = Math.round((stats.completed / stats.total) * 100);
                return (
                  <div key={category} className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate flex-grow mr-2">{category}</span>
                      <span className="text-gray-500 flex-shrink-0">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${categoryRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-lg font-bold text-gray-800">{totalTasks}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-lg font-bold text-gray-800">{Object.keys(categoryStats).length}</p>
          <p className="text-xs text-gray-500">Categories</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-lg font-bold text-gray-800">{habits.length}</p>
          <p className="text-xs text-gray-500">Habits</p>
        </div>
      </div>

      {totalTasks === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs mt-1">Click + to add your first task</p>
        </div>
      )}
    </div>
  );
};

export default MyStats;
