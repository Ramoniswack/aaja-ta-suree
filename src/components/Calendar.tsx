import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Cookies from "js-cookie";
import TodoService from "../services/todoService";
import type { TodoItem } from "../types/types";

const Calendar = () => {
  const loggedUser = JSON.parse(Cookies.get("loggedInUser") || "{}");
  const userId = loggedUser.email;
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const unsubscribe = TodoService.subscribeTodos(userId, (firebaseTodos) => {
      const mappedTodos = firebaseTodos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        done: todo.done,
        dueDate: todo.dueDate,
      }));
      setTodos(mappedTodos);
      console.log("Calendar loaded todos:", mappedTodos);
    });

    return () => unsubscribe();
  }, [userId]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    const checkDate = new Date(year, month, day);
    return isSameDay(today, checkDate);
  };

  const isSelected = (day: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isSameDay(selectedDate, checkDate);
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getTasksForDate = (day: number) => {
    const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
    const tasksForDate = todos.filter((todo) => todo.dueDate === dateStr);
    return tasksForDate;
  };

  const getTasksForSelectedDate = () => {
    const dateStr = formatDateString(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const tasksForDate = todos.filter((todo) => todo.dueDate === dateStr);
    console.log("Selected date:", dateStr, "Tasks:", tasksForDate);
    return tasksForDate;
  };

  const selectedDateTasks = getTasksForSelectedDate();
  const today = new Date();
  const isTodaySelected = isSameDay(selectedDate, today);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
          <FiChevronLeft className="text-lg" />
        </button>
        <h2 className="text-base font-semibold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition">
          <FiChevronRight className="text-lg" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
          <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const tasksForDay = getTasksForDate(day);
          const hasTasks = tasksForDay.length > 0;
          const todayCheck = isToday(day, currentDate.getMonth(), currentDate.getFullYear());

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition ${
                todayCheck
                  ? "bg-indigo-600 text-white font-bold"
                  : isSelected(day)
                  ? "bg-indigo-100 text-indigo-600 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <span>{day}</span>
              {hasTasks && (
                <div className="flex gap-0.5 mt-0.5">
                  {tasksForDay.slice(0, 3).map((_, idx) => (
                    <div key={idx} className={`w-1 h-1 rounded-full ${todayCheck ? "bg-white" : "bg-indigo-600"}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tasks for Selected Date */}
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold mb-2">
          {isTodaySelected 
            ? "Today's Tasks" 
            : selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </h3>
        <div className="max-h-[180px] overflow-y-auto pr-1">
          {selectedDateTasks.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-xs">No tasks for this day</p>
              {isTodaySelected && (
                <p className="text-xs mt-1 text-indigo-600">Click + to add a task for today</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDateTasks.map((todo) => (
                <div key={todo.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <input type="checkbox" checked={todo.done} readOnly className="w-3 h-3 flex-shrink-0" />
                  <span className={`flex-grow break-words ${todo.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
