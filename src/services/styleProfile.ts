// Style Profile Service - tracks user preferences
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizResult, FurnitureStyle } from '../types';

const STYLE_PROFILE_KEY = '@furniq_style_profile';
const QUIZ_RESULT_KEY = '@furniq_quiz_result';

interface StyleProfile {
  styles: Record<string, number>;
  categories: Record<string, number>;
  lastUpdated: number;
}

export const StyleProfileService = {
  // Get current style profile
  async getProfile(): Promise<StyleProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STYLE_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting style profile:', error);
      return null;
    }
  },

  // Add style from analysis result
  async addStyle(style: string, category: string): Promise<void> {
    try {
      const profile = await this.getProfile() || {
        styles: {},
        categories: {},
        lastUpdated: Date.now(),
      };

      // Increment style count
      profile.styles[style] = (profile.styles[style] || 0) + 1;
      
      // Increment category count
      profile.categories[category] = (profile.categories[category] || 0) + 1;
      
      profile.lastUpdated = Date.now();

      await AsyncStorage.setItem(STYLE_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error adding style:', error);
    }
  },

  // Get top preferred style
  async getPreferredStyle(): Promise<string | null> {
    const profile = await this.getProfile();
    if (!profile || Object.keys(profile.styles).length === 0) {
      return null;
    }

    const entries = Object.entries(profile.styles);
    entries.sort((a, b) => b[1] - a[1]);
    
    return entries[0][0];
  },

  // Get top preferred category
  async getPreferredCategory(): Promise<string | null> {
    const profile = await this.getProfile();
    if (!profile || Object.keys(profile.categories).length === 0) {
      return null;
    }

    const entries = Object.entries(profile.categories);
    entries.sort((a, b) => b[1] - a[1]);
    
    return entries[0][0];
  },

  // Get top N styles (for "For you" section)
  async getTopStyles(count: number = 3): Promise<string[]> {
    const profile = await this.getProfile();
    if (!profile || Object.keys(profile.styles).length === 0) {
      return [];
    }

    const entries = Object.entries(profile.styles);
    entries.sort((a, b) => b[1] - a[1]);
    
    return entries.slice(0, count).map(([style]) => style);
  },

  // Clear profile
  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STYLE_PROFILE_KEY);
      await AsyncStorage.removeItem(QUIZ_RESULT_KEY);
    } catch (error) {
      console.error('Error clearing style profile:', error);
    }
  },

  // ========== Quiz Result Methods ==========

  // Save quiz result
  async saveQuizResult(result: QuizResult): Promise<void> {
    try {
      await AsyncStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(result));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  },

  // Get quiz result
  async getQuizResult(): Promise<QuizResult | null> {
    try {
      const data = await AsyncStorage.getItem(QUIZ_RESULT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting quiz result:', error);
      return null;
    }
  },

  // Check if user has taken the quiz
  async hasCompletedQuiz(): Promise<boolean> {
    const result = await this.getQuizResult();
    return result !== null;
  },

  // Get quiz style (shorthand)
  async getQuizStyle(): Promise<FurnitureStyle | null> {
    const result = await this.getQuizResult();
    return result?.style || null;
  },
};
