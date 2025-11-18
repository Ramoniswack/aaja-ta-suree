import NotificationService from './notificationService';
import type { TodoItem } from '../types/types';

export class ReminderService {
  private static instance: ReminderService;
  private reminderInterval: NodeJS.Timeout | null = null;
  private readonly REMINDER_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
  private scheduledReminders: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  // Start the reminder system
  startReminders(getTodos: () => TodoItem[]): void {
    // Clear any existing interval
    this.stopReminders();

    // Send initial reminder
    this.checkAndSendReminder(getTodos);

    // Set up recurring reminders every 3 hours
    this.reminderInterval = setInterval(() => {
      this.checkAndSendReminder(getTodos);
    }, this.REMINDER_INTERVAL);

    console.log('Reminder system started - will check every 3 hours');
  }

  // Stop the reminder system
  stopReminders(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('Reminder system stopped');
    }
    
    // Clear all scheduled reminders
    this.scheduledReminders.forEach(timeout => clearTimeout(timeout));
    this.scheduledReminders.clear();
  }

  // Schedule specific reminder times for a todo
  scheduleReminderTimes(todo: TodoItem): void {
    if (!todo.reminderTimes || todo.reminderTimes.length === 0) return;

    todo.reminderTimes.forEach((timeStr) => {
      const reminderTime = new Date(timeStr);
      const now = new Date();
      
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();
        const timeoutId = setTimeout(async () => {
          await this.sendTaskReminder(todo);
          if (todo.id) {
            this.scheduledReminders.delete(`${todo.id}-${timeStr}`);
          }
        }, delay);
        
        if (todo.id) {
          this.scheduledReminders.set(`${todo.id}-${timeStr}`, timeoutId);
        }
      }
    });
  }

  // Send reminder for specific task
  private async sendTaskReminder(todo: TodoItem): Promise<void> {
    const title = 'Task Reminder';
    const body = `Don't forget: ${todo.text}`;

    // Send to notification service (handles mobile)
    await NotificationService.sendImmediateNotification(title, body);

    // Also show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/ats.png',
        badge: '/ats.png',
        tag: `todo-reminder-${todo.id}`,
        requireInteraction: true,
      });
    }
  }

  // Check todos and send reminder if needed
  private async checkAndSendReminder(getTodos: () => TodoItem[]): Promise<void> {
    const todos = getTodos();
    const pendingTodos = todos.filter((todo) => !todo.done);

    if (pendingTodos.length === 0) {
      console.log('No pending tasks - no reminder sent');
      return;
    }

    const title = 'Task Reminder';
    const body = `You have ${pendingTodos.length} pending task${
      pendingTodos.length > 1 ? 's' : ''
    } to complete!`;

    // Send notification
    await NotificationService.sendImmediateNotification(title, body);

    // Also show browser notification if available
    this.showBrowserNotification(title, body, pendingTodos);
  }

  // Show browser notification (for web)
  private showBrowserNotification(
    title: string,
    body: string,
    pendingTodos: TodoItem[]
  ): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const taskList = pendingTodos
        .slice(0, 3)
        .map((todo) => `• ${todo.text}`)
        .join('\n');
      
      const fullBody = `${body}\n\n${taskList}${
        pendingTodos.length > 3 ? '\n...and more' : ''
      }`;

      new Notification(title, {
        body: fullBody,
        icon: '/ats.png',
        badge: '/ats.png',
        tag: 'todo-reminder',
        requireInteraction: false,
      });
    }
  }

  // Request browser notification permission
  async requestBrowserNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
}

export default ReminderService.getInstance();
