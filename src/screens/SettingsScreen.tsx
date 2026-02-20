// Settings Screen - Feature 1
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { getSettings, saveSettings } from '../services/settings';
import { Settings } from '../types';

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', currency: 'EUR' },
  { code: 'AT', name: 'Österreich', flag: '🇦🇹', currency: 'EUR' },
  { code: 'CH', name: 'Schweiz', flag: '🇨🇭', currency: 'CHF' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
] as const;

export default function SettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<Settings>({
    country: 'DE',
    darkMode: false,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const s = await getSettings();
    setSettings(s);
    setLoading(false);
  };

  const updateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings({ [key]: value });
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const resetData = () => {
    Alert.alert(
      'Daten zurücksetzen',
      'Alle Einstellungen auf Standard zurücksetzen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            await saveSettings({
              country: 'DE',
              darkMode: false,
              notificationsEnabled: true,
            });
            loadSettings();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Lädt...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Land Auswahl */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Land</Text>
        <Text style={styles.sectionSubtitle}>
          Bestimmt welche Shops angezeigt werden
        </Text>
        <View style={styles.countryGrid}>
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.countryButton,
                settings.country === country.code && styles.countryButtonActive,
              ]}
              onPress={() => updateSetting('country', country.code)}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text
                style={[
                  styles.countryName,
                  settings.country === country.code && styles.countryNameActive,
                ]}
              >
                {country.name}
              </Text>
              <Text style={styles.countryCurrency}>{country.currency}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Einstellungen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Einstellungen</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Dunkles Design (in Entwicklung)
            </Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
            disabled
            trackColor={{ false: '#E0E0E0', true: '#1A5F5A' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Benachrichtigungen</Text>
            <Text style={styles.settingDescription}>
              Preise & Deals (in Entwicklung)
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              updateSetting('notificationsEnabled', value)
            }
            disabled
            trackColor={{ false: '#E0E0E0', true: '#1A5F5A' }}
          />
        </View>
      </View>

      {/* Über */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Über</Text>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => openLink('https://example.com/datenschutz')}
        >
          <Text style={styles.linkText}>Datenschutzerklärung</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => openLink('https://example.com/impressum')}
        >
          <Text style={styles.linkText}>Impressum</Text>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={resetData}>
          <Text style={styles.linkTextDanger}>Einstellungen zurücksetzen</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.version}>
        <Text style={styles.versionText}>Furniq v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  countryButton: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  countryButtonActive: {
    backgroundColor: '#1A5F5A',
  },
  countryFlag: {
    fontSize: 28,
    marginBottom: 4,
  },
  countryName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  countryNameActive: {
    color: '#FFF',
  },
  countryCurrency: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkText: {
    fontSize: 16,
    color: '#1A5F5A',
  },
  linkTextDanger: {
    fontSize: 16,
    color: '#FF4444',
  },
  linkArrow: {
    fontSize: 16,
    color: '#999',
  },
  version: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});
