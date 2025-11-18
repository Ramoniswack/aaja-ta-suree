import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCheckSquare, FiCalendar, FiBarChart2, FiLogOut } from "react-icons/fi";
import Cookies from "js-cookie";
import Tasks from "../components/Tasks";
import Calendar from "../components/Calendar";
import MyStats from "../components/MyStats";
import Footer from "../components/Footer";
import TodoService from "../services/todoService";
import ReminderService from "../services/reminderService";

type TabType = "tasks" | "calendar" | "stats";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const loggedUser = JSON.parse(Cookies.get("loggedInUser") || "{}");
  const userId = loggedUser.email;

  useEffect(() => {
    // Subscribe to todos and schedule reminders
    const unsubscribe = TodoService.subscribeTodos(userId, (todos) => {
      // Schedule reminders for each todo with reminder times
      todos.forEach((todo) => {
        if (todo.reminderTimes && todo.reminderTimes.length > 0) {
          ReminderService.scheduleReminderTimes(todo);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const handleLogout = () => {
    ReminderService.stopReminders();
    Cookies.remove("loggedInUser");
    navigate("/");
  };

  const handleAddTask = () => {
    navigate("/todo");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex-grow flex justify-center items-start px-4 py-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10"></div>
          
          {/* Header */}
          <div className="relative p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/ats.png"
                    alt="Logo"
                    className="w-16 h-16 rounded-full shadow-lg ring-4 ring-white"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 leading-tight">
                    Welcome, <span className="text-indigo-600">{loggedUser.name || "User"}</span>!
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your tasks efficiently</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                title="Logout"
              >
                <FiLogOut className="text-xl" />
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[400px]">
            {activeTab === "tasks" && <Tasks />}
            {activeTab === "calendar" && <Calendar />}
            {activeTab === "stats" && <MyStats />}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t bg-white rounded-b-2xl shadow-inner">
            <div className="flex items-center justify-around p-4">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "tasks" 
                    ? "text-indigo-600 scale-110" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === "tasks" ? "bg-indigo-50" : ""}`}>
                  <FiCheckSquare className="text-2xl" />
                </div>
                <span className="text-xs font-medium">Tasks</span>
              </button>

              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "calendar" 
                    ? "text-indigo-600 scale-110" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === "calendar" ? "bg-indigo-50" : ""}`}>
                  <FiCalendar className="text-2xl" />
                </div>
                <span className="text-xs font-medium">Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab("stats")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "stats" 
                    ? "text-indigo-600 scale-110" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-2 rounded-xl ${activeTab === "stats" ? "bg-indigo-50" : ""}`}>
                  <FiBarChart2 className="text-2xl" />
                </div>
                <span className="text-xs font-medium">My Stats</span>
              </button>
            </div>
          </div>

          {/* Floating Add Button with gradient */}
          <button
            onClick={handleAddTask}
            className="absolute bottom-24 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          >
            <FiPlus className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
