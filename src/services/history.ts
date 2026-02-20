// History Service - Feature 3
// Speichert Suchverlauf lokal (AsyncStorage) und in Supabase (wenn eingeloggt)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '../types';
import { addSearchHistory as addSupabaseHistory, getSearchHistory as getSupabaseHistory, getCurrentUser } from './supabase';

const HISTORY_KEY = '@furniture_finder_history';
const MAX_LOCAL_ITEMS = 20;

export interface HistoryItem {
  id: string;
  query: string;
  category: string;
  style: string;
  imageUri: string;
  productCount: number;
  timestamp: number;
}

/**
 * Add item to local history + Supabase (if logged in)
 */
export async function addToHistory(
  query: string,
  analysis: AnalysisResult,
  imageUri: string,
  productCount: number
): Promise<void> {
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    query,
    category: analysis.category,
    style: analysis.style,
    imageUri,
    productCount,
    timestamp: Date.now(),
  };

  // 1. Save to local AsyncStorage
  try {
    const existing = await getLocalHistory();
    const updated = [item, ...existing].slice(0, MAX_LOCAL_ITEMS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving local history:', error);
  }

  // 2. Save to Supabase (if logged in)
  try {
    await addSupabaseHistory(query, analysis, productCount);
  } catch (error) {
    console.error('Error saving Supabase history:', error);
  }
}

/**
 * Get history - prefers Supabase if logged in, otherwise local
 */
export async function getHistory(): Promise<HistoryItem[]> {
  // Check if user is logged in
  const user = await getCurrentUser();
  
  if (user) {
    // Get from Supabase
    try {
      const supabaseHistory = await getSupabaseHistory(10);
      if (supabaseHistory.length > 0) {
        return supabaseHistory.map(h => ({
          id: h.id,
          query: h.query,
          category: h.analysis.category,
          style: h.analysis.style,
          imageUri: '', // Supabase doesn't store image
          productCount: h.productCount,
          timestamp: new Date(h.created_at).getTime(),
        }));
      }
    } catch (error) {
      console.error('Error getting Supabase history:', error);
    }
  }

  // Fallback to local
  return getLocalHistory();
}

/**
 * Get local history from AsyncStorage
 */
export async function getLocalHistory(): Promise<HistoryItem[]> {
  try {
    const stored = await AsyncStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading local history:', error);
  }
  return [];
}

/**
 * Clear all history (local + Supabase)
 */
export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing local history:', error);
  }
  // Supabase history would need a delete function - for now just local
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  if (days === 1) return 'gestern';
  if (days < 7) return `vor ${days} Tagen`;
  
  return new Date(timestamp).toLocaleDateString('de-DE');
}
