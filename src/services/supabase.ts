// Supabase client configuration + Auth + Favorites
// SECURITY: Auth tokens werden in SecureStore (iOS Keychain) gespeichert
import { createClient, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FurnitureItem, AnalysisResult } from '../types';
import { getSettings } from './settings';

// Placeholder URLs - müssen durch echte Supabase Credentials ersetzt werden
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// SECURITY: SecureStore nutzt iOS Keychain (verschlüsselt)
const SECURE_STORE_PREFIX = 'sb-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auth Tokens in SecureStore (iOS Keychain) - sicherer als AsyncStorage
    storage: {
      getItem: async (key: string): Promise<string | null> => {
        try {
          const value = await SecureStore.getItemAsync(SECURE_STORE_PREFIX + key);
          return value;
        } catch {
          // Fallback zu AsyncStorage falls SecureStore fehlschlägt
          return AsyncStorage.getItem(key);
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          await SecureStore.setItemAsync(SECURE_STORE_PREFIX + key, value);
        } catch {
          // Fallback
          await AsyncStorage.setItem(key, value);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          await SecureStore.deleteItemAsync(SECURE_STORE_PREFIX + key);
        } catch {
          await AsyncStorage.removeItem(key);
        }
      },
    },
    autoRefreshToken: true,
    persistSession: true,
  },
});

// ========== AUTH HELPERS ==========

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'furniturefinder://auth/callback',
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  // Return null user - actual user will be set via onAuthStateChange
  return { user: null, error: null };
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Listen to auth changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

// ========== FAVORITES HELPERS ==========

const FAVORITES_KEY = 'favorites';

/**
 * Get all favorites for current user
 */
export async function getFavorites(): Promise<FurnitureItem[]> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Return local storage favorites for non-authenticated users
    return getLocalFavorites();
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('furniture_item')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return getLocalFavorites();
  }

  return data.map(item => JSON.parse(item.furniture_item));
}

/**
 * Add item to favorites
 */
export async function addFavorite(item: FurnitureItem): Promise<{ success: boolean; error: string | null }> {
  const user = await getCurrentUser();
  
  if (!user) {
    // Save to local storage for non-authenticated users
    return addLocalFavorite(item);
  }

  const { error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      furniture_item: JSON.stringify(item),
    });

  if (error) {
    console.error('Error adding favorite:', error);
    // Fallback to local
    return addLocalFavorite(item);
  }

  return { success: true, error: null };
}

/**
 * Remove item from favorites
 */
export async function removeFavorite(itemId: string): Promise<{ success: boolean; error: string | null }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return removeLocalFavorite(itemId);
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('id', itemId);

  if (error) {
    console.error('Error removing favorite:', error);
    return removeLocalFavorite(itemId);
  }

  return { success: true, error: null };
}

// ========== LOCAL STORAGE FALLBACK ==========

async function getLocalFavorites(): Promise<FurnitureItem[]> {
  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function addLocalFavorite(item: FurnitureItem): Promise<{ success: boolean; error: string | null }> {
  try {
    const favorites = await getLocalFavorites();
    const newFavorite = { ...item, id: `local-${Date.now()}` };
    favorites.unshift(newFavorite);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: 'Failed to save locally' };
  }
}

async function removeLocalFavorite(itemId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const favorites = await getLocalFavorites();
    const filtered = favorites.filter(f => f.id !== itemId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return { success: true, error: null };
  } catch {
    return { success: false, error: 'Failed to remove locally' };
  }
}

// ========== COUNTRY DETECTION ==========

export type Country = 'DE' | 'AT' | 'CH' | 'US' | 'UK' | 'OTHER';

interface CountryConfig {
  code: Country;
  name: string;
  currency: string;
  amazonDomain: string;
  ikeaDomain: string;
  wayfairDomain: string;
}

export const COUNTRY_CONFIGS: Record<Country, CountryConfig> = {
  DE: {
    code: 'DE',
    name: 'Deutschland',
    currency: 'EUR',
    amazonDomain: 'amazon.de',
    ikeaDomain: 'ikea.com/de',
    wayfairDomain: 'wayfair.de',
  },
  AT: {
    code: 'AT',
    name: 'Österreich',
    currency: 'EUR',
    amazonDomain: 'amazon.at',
    ikeaDomain: 'ikea.com/at',
    wayfairDomain: 'wayfair.de', // Falls verfügbar
  },
  CH: {
    code: 'CH',
    name: 'Schweiz',
    currency: 'CHF',
    amazonDomain: 'amazon.ch',
    ikeaDomain: 'ikea.com/ch',
    wayfairDomain: 'wayfair.com',
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    amazonDomain: 'amazon.com',
    ikeaDomain: 'ikea.com/us',
    wayfairDomain: 'wayfair.com',
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    amazonDomain: 'amazon.co.uk',
    ikeaDomain: 'ikea.com/gb',
    wayfairDomain: 'wayfair.co.uk',
  },
  OTHER: {
    code: 'OTHER',
    name: 'Other',
    currency: 'USD',
    amazonDomain: 'amazon.com',
    ikeaDomain: 'ikea.com',
    wayfairDomain: 'wayfair.com',
  },
};

/**
 * Detect user country from settings
 * Falls Settings nicht verfügbar, Default zu Deutschland (DE)
 */
export async function detectCountry(): Promise<Country> {
  try {
    const settings = await getSettings();
    return settings.country;
  } catch (error) {
    // Fallback zu Germany
    return 'DE';
  }
}

/**
 * Get country config for current user
 */
export async function getCountryConfig(): Promise<CountryConfig> {
  const country = await detectCountry();
  return COUNTRY_CONFIGS[country];
}

// ========== SEARCH HISTORY ==========

/**
 * Save search to history
 */
export async function addSearchHistory(
  query: string,
  analysis: AnalysisResult,
  productCount: number
): Promise<{ success: boolean; error: string | null }> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { success: true, error: null }; // Don't save for anonymous users
  }

  const { error } = await supabase
    .from('search_history')
    .insert({
      user_id: user.id,
      query,
      analysis_result: JSON.stringify(analysis),
      product_count: productCount,
    });

  if (error) {
    console.error('Error saving search history:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Get search history for current user
 */
export async function getSearchHistory(limit: number = 10): Promise<Array<{
  id: string;
  query: string;
  analysis: AnalysisResult;
  created_at: string;
  productCount: number;
}>> {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching search history:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    query: item.query,
    analysis: JSON.parse(item.analysis_result),
    created_at: item.created_at,
    productCount: item.product_count,
  }));
}
