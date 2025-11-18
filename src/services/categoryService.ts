import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const DEFAULT_CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Shopping',
  'Study',
  'Finance',
];

export class CategoryService {
  private static instance: CategoryService;
  private readonly COLLECTION_NAME = 'userCategories';

  private constructor() {}

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  // Get user categories
  async getCategories(userId: string): Promise<string[]> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.categories || DEFAULT_CATEGORIES;
      }

      // Initialize with default categories
      await this.saveCategories(userId, DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error getting categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  // Save user categories
  async saveCategories(userId: string, categories: string[]): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(docRef, {
        categories,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  }

  // Add a new category
  async addCategory(userId: string, category: string): Promise<void> {
    try {
      const categories = await this.getCategories(userId);
      if (!categories.includes(category)) {
        categories.push(category);
        await this.saveCategories(userId, categories);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Subscribe to category changes
  subscribeCategories(
    userId: string,
    callback: (categories: string[]) => void
  ): () => void {
    const docRef = doc(db, this.COLLECTION_NAME, userId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback(data.categories || DEFAULT_CATEGORIES);
        } else {
          callback(DEFAULT_CATEGORIES);
        }
      },
      (error) => {
        console.error('Error in category subscription:', error);
        callback(DEFAULT_CATEGORIES);
      }
    );

    return unsubscribe;
  }
}

export default CategoryService.getInstance();
