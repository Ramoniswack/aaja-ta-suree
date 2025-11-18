import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { TodoItem } from '../types/types';

export interface FirebaseTodoItem {
  id?: string;
  userId: string;
  text: string;
  done: boolean;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  reminderTimes?: string[];
  isHabit?: boolean;
  habitFrequency?: 'daily' | 'weekly' | 'monthly';
  subtasks?: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class TodoService {
  private static instance: TodoService;
  private readonly COLLECTION_NAME = 'todos';

  private constructor() {}

  static getInstance(): TodoService {
    if (!TodoService.instance) {
      TodoService.instance = new TodoService();
    }
    return TodoService.instance;
  }

  // Add a new todo
  async addTodo(
    userId: string,
    text: string,
    description?: string,
    additionalData?: Partial<FirebaseTodoItem>
  ): Promise<string> {
    try {
      const todoData: any = {
        userId,
        text,
        description: description || '',
        done: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add additional data if provided, removing undefined values
      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          const value = (additionalData as any)[key];
          if (value !== undefined && value !== null) {
            todoData[key] = value;
          }
        });
      }

      const docRef = await addDoc(
        collection(db, this.COLLECTION_NAME),
        todoData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  }

  // Update a todo
  async updateTodo(
    todoId: string,
    updates: Partial<TodoItem>
  ): Promise<void> {
    try {
      const todoRef = doc(db, this.COLLECTION_NAME, todoId);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      await updateDoc(todoRef, updateData);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // Delete a todo
  async deleteTodo(todoId: string): Promise<void> {
    try {
      const todoRef = doc(db, this.COLLECTION_NAME, todoId);
      await deleteDoc(todoRef);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // Get all todos for a user
  async getTodos(userId: string): Promise<FirebaseTodoItem[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const todos: FirebaseTodoItem[] = [];
      querySnapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() } as FirebaseTodoItem);
      });
      
      return todos;
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeTodos(
    userId: string,
    callback: (todos: FirebaseTodoItem[]) => void
  ): () => void {
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const todos: FirebaseTodoItem[] = [];
        querySnapshot.forEach((doc) => {
          todos.push({ id: doc.id, ...doc.data() } as FirebaseTodoItem);
        });
        callback(todos);
      },
      (error) => {
        console.error('Error in real-time subscription:', error);
      }
    );

    return unsubscribe;
  }

  // Delete all todos for a user
  async deleteAllTodos(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting all todos:', error);
      throw error;
    }
  }

  // Toggle todo done status
  async toggleTodoDone(todoId: string, currentStatus: boolean): Promise<void> {
    await this.updateTodo(todoId, { done: !currentStatus });
  }
}

export default TodoService.getInstance();
