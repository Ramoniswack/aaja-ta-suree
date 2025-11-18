export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TodoItem {
  id?: string;
  text: string;
  done: boolean;
  description?: string;
  reminderTime?: Date;
  category?: string;
  reminderTimes?: string[];
  subtasks?: SubTask[];
  isHabit?: boolean;
  habitFrequency?: 'daily' | 'weekly' | 'monthly';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface SubTask {
  id: string;
  text: string;
  done: boolean;
}