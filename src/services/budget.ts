// Budget Service - Persist and manage user budget preference
import AsyncStorage from '@react-native-async-storage/async-storage';

const BUDGET_KEY = '@furniq_budget';

export interface BudgetState {
  maxBudget: number | null; // null = kein Limit
  isEnabled: boolean;
}

/**
 * Get current budget from storage
 */
export async function getBudget(): Promise<BudgetState> {
  try {
    const stored = await AsyncStorage.getItem(BUDGET_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        maxBudget: data.maxBudget,
        isEnabled: data.maxBudget !== null && data.maxBudget > 0,
      };
    }
    return { maxBudget: null, isEnabled: false };
  } catch (error) {
    console.error('Error loading budget:', error);
    return { maxBudget: null, isEnabled: false };
  }
}

/**
 * Set budget max price
 * @param max - Maximum price (number) or null/undefined for no limit
 */
export async function setBudget(max: number | null): Promise<void> {
  try {
    const data = {
      maxBudget: max,
    };
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving budget:', error);
  }
}

/**
 * Clear budget (disable budget filter)
 */
export async function clearBudget(): Promise<void> {
  try {
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify({ maxBudget: null }));
  } catch (error) {
    console.error('Error clearing budget:', error);
  }
}

/**
 * Check if a product is within budget
 */
export function isWithinBudget(price: number, maxBudget: number | null): boolean {
  if (maxBudget === null || maxBudget === 0) return true;
  return price <= maxBudget;
}
