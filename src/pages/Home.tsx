import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiCheckSquare, FiCalendar, FiBarChart2, FiLogOut } from "react-icons/fi";
import Cookies from "js-cookie";
import Tasks from "../components/Tasks";
import Calendar from "../components/Calendar";
import MyStats from "../components/MyStats";
import TodoService from "../services/todoService";
import ReminderService from "../services/reminderService";
import NotificationService from "../services/notificationService";

type TabType = "tasks" | "calendar" | "stats";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("tasks");
  const loggedUser = JSON.parse(Cookies.get("loggedInUser") || "{}");
  const userId = loggedUser.email;

  useEffect(() => {
    const initNotifications = async () => {
      await NotificationService.initializeLocalNotifications();
      await NotificationService.initializePushNotifications();
      await ReminderService.requestBrowserNotificationPermission();
    };
    
    initNotifications();

    const unsubscribe = TodoService.subscribeTodos(userId, (todos) => {
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
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-full flex flex-col relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/ats.png"
                  alt="Logo"
                  className="w-11 h-11 rounded-full shadow-md ring-2 ring-white"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800 leading-tight">
                  Welcome, <span className="text-indigo-600">{loggedUser.name || "User"}</span>!
                </h1>
                <p className="text-xs text-gray-500">Manage tasks efficiently</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Logout"
            >
              <FiLogOut className="text-lg" />
            </button>
          </div>
        </div>

        {/* Notification Permission Banner */}
        {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
          <div className="mx-4 mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-xs text-indigo-800 mb-2">
              {/iPhone|iPad|iPod/.test(navigator.userAgent) 
                ? 'iOS Safari does not support web notifications. For full notification support, we recommend using Chrome on Android or desktop.'
                : 'Enable notifications to get reminders!'}
            </p>
            {!/iPhone|iPad|iPod/.test(navigator.userAgent) && (
              <button
                onClick={async () => {
                  const permission = await Notification.requestPermission();
                  if (permission === 'granted') {
                    await NotificationService.sendImmediateNotification(
                      'Notifications Enabled',
                      'You will now receive task reminders'
                    );
                  }
                }}
                className="w-full py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition"
              >
                Enable Notifications
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
          {activeTab === "tasks" && <Tasks />}
          {activeTab === "calendar" && <Calendar />}
          {activeTab === "stats" && <MyStats />}
        </div>

        {/* Bottom Nav */}
        <div className="border-t bg-white shadow-inner flex-shrink-0 relative z-20">
          <div className="flex items-center justify-around py-2 px-2">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-lg ${
                activeTab === "tasks" 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiCheckSquare className="text-xl" />
              <span className="text-xs font-medium">Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-lg ${
                activeTab === "calendar" 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiCalendar className="text-xl" />
              <span className="text-xs font-medium">Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-lg ${
                activeTab === "stats" 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FiBarChart2 className="text-xl" />
              <span className="text-xs font-medium">Stats</span>
            </button>
          </div>
        </div>

        {/* Floating Button */}
        <button
          onClick={handleAddTask}
          className="absolute bottom-16 right-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-12 h-12 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group z-30"
        >
          <FiPlus className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default Home;
