// Settings Service - Phase 5d
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../types';

const SETTINGS_KEY = '@furniture_finder_settings';

const DEFAULT_SETTINGS: Settings = {
  country: 'DE',
  darkMode: false,
  notificationsEnabled: true,
};

/**
 * Load settings from AsyncStorage
 */
export async function getSettings(): Promise<Settings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to AsyncStorage
 */
export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Reset settings to default
 */
export async function resetSettings(): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
}
