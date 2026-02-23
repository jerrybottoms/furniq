// Settings Screen - Feature 1 + Dark Mode
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
  TextInput,
} from 'react-native';
import { getSettings, saveSettings } from '../services/settings';
import { getBudget, setBudget, clearBudget } from '../services/budget';
import { Settings } from '../types';
import { useTheme } from '../context/ThemeContext';

const COUNTRIES = [
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', currency: 'EUR' },
  { code: 'AT', name: 'Österreich', flag: '🇦🇹', currency: 'EUR' },
  { code: 'CH', name: 'Schweiz', flag: '🇨🇭', currency: 'CHF' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
] as const;

type ThemeMode = 'light' | 'dark' | 'system';

export default function SettingsScreen({ navigation }: any) {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    country: 'DE',
    darkMode: false,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [budgetValue, setBudgetValue] = useState('');
  const [budgetEnabled, setBudgetEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const s = await getSettings();
    setSettings(s);
    
    // Load budget
    const budget = await getBudget();
    if (budget.maxBudget !== null && budget.maxBudget > 0) {
      setBudgetValue(budget.maxBudget.toString());
      setBudgetEnabled(true);
    }
    
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
            setThemeMode('system');
            loadSettings();
          },
        },
      ]
    );
  };

  const themeModes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'system', label: 'System', icon: '📱' },
    { value: 'light', label: 'Hell', icon: '☀️' },
    { value: 'dark', label: 'Dunkel', icon: '🌙' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Lädt...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Dark Mode Auswahl */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🌙 Design</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Wähle dein bevorzugtes Design
        </Text>
        
        <View style={styles.themeModeContainer}>
          {themeModes.map((mode) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.themeModeButton,
                {
                  backgroundColor: themeMode === mode.value ? theme.primary : theme.surface,
                  borderColor: themeMode === mode.value ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setThemeMode(mode.value)}
            >
              <Text style={styles.themeModeIcon}>{mode.icon}</Text>
              <Text
                style={[
                  styles.themeModeLabel,
                  { color: themeMode === mode.value ? '#FFF' : theme.text },
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Land Auswahl */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🌍 Land</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Bestimmt welche Shops angezeigt werden
        </Text>
        <View style={styles.countryGrid}>
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.countryButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: settings.country === country.code ? theme.primary : theme.border,
                },
                settings.country === country.code && { backgroundColor: theme.primary },
              ]}
              onPress={() => updateSetting('country', country.code)}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text
                style={[
                  styles.countryName,
                  { color: settings.country === country.code ? '#FFF' : theme.text },
                ]}
              >
                {country.name}
              </Text>
              <Text style={[styles.countryCurrency, { color: theme.textSecondary }]}>
                {country.currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Einstellungen */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>⚙️ Einstellungen</Text>

        <View style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Benachrichtigungen</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Preise & Deals (in Entwicklung)
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              updateSetting('notificationsEnabled', value)
            }
            disabled
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {/* Price Alerts Link */}
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}
          onPress={() => navigation.navigate('PriceAlerts')}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>🔔 Preis-Alarme</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Verwalte deine Preisbenachrichtigungen
            </Text>
          </View>
          <Text style={[styles.linkArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Budget Section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>💰 Budget</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Maximale Preisgrenze für Produkte
        </Text>

        {/* Budget Toggle */}
        <View style={[styles.settingRow, { borderBottomColor: theme.borderLight }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Budget-Filter aktivieren</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Zeigt nur Produkte bis zu diesem Preis
            </Text>
          </View>
          <Switch
            value={budgetEnabled}
            onValueChange={async (value) => {
              setBudgetEnabled(value);
              if (value && budgetValue) {
                await setBudget(parseFloat(budgetValue));
              } else {
                await clearBudget();
              }
            }}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {/* Budget Input */}
        {budgetEnabled && (
          <View style={styles.budgetInputContainer}>
            <Text style={[styles.budgetLabel, { color: theme.text }]}>Maximalpreis</Text>
            <View style={styles.budgetInputRow}>
              <TextInput
                style={[
                  styles.budgetInput,
                  { 
                    backgroundColor: theme.surface, 
                    borderColor: theme.border, 
                    color: theme.text 
                  }
                ]}
                value={budgetValue}
                onChangeText={(text) => {
                  setBudgetValue(text);
                  const numValue = parseFloat(text);
                  if (!isNaN(numValue) && numValue > 0) {
                    setBudget(numValue);
                  }
                }}
                placeholder="500"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
              <Text style={[styles.budgetSuffix, { color: theme.textSecondary }]}>€</Text>
            </View>
            
            {/* Quick Select Buttons */}
            <View style={styles.quickBudgetRow}>
              {[100, 250, 500, 1000, 2000].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickBudgetButton,
                    { 
                      backgroundColor: budgetValue === value.toString() ? theme.primary : theme.surface,
                      borderColor: budgetValue === value.toString() ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => {
                    setBudgetValue(value.toString());
                    setBudget(value);
                  }}
                >
                  <Text style={[
                    styles.quickBudgetText,
                    { color: budgetValue === value.toString() ? '#FFF' : theme.text }
                  ]}>
                    {value}€
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clear Budget Button */}
            <TouchableOpacity
              style={[styles.clearBudgetButton, { borderColor: theme.error }]}
              onPress={async () => {
                setBudgetValue('');
                setBudgetEnabled(false);
                await clearBudget();
              }}
            >
              <Text style={[styles.clearBudgetText, { color: theme.error }]}>Kein Limit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Über */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>ℹ️ Über</Text>

        <TouchableOpacity
          style={[styles.linkRow, { borderBottomColor: theme.borderLight }]}
          onPress={() => openLink('https://example.com/datenschutz')}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>Datenschutzerklärung</Text>
          <Text style={[styles.linkArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkRow, { borderBottomColor: theme.borderLight }]}
          onPress={() => openLink('https://example.com/impressum')}
        >
          <Text style={[styles.linkText, { color: theme.primary }]}>Impressum</Text>
          <Text style={[styles.linkArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.linkRow, { borderBottomColor: theme.borderLight }]} onPress={resetData}>
          <Text style={styles.linkTextDanger}>Einstellungen zurücksetzen</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.version}>
        <Text style={[styles.versionText, { color: theme.textMuted }]}>Furniq v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  themeModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeModeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themeModeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  themeModeLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    alignItems: 'center',
    borderWidth: 1,
  },
  countryFlag: {
    fontSize: 28,
    marginBottom: 4,
  },
  countryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  countryCurrency: {
    fontSize: 11,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 16,
  },
  linkTextDanger: {
    fontSize: 16,
    color: '#FF4444',
  },
  linkArrow: {
    fontSize: 16,
  },
  version: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
  
  // Budget Styles
  budgetInputContainer: {
    paddingTop: 16,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  budgetSuffix: {
    fontSize: 16,
    marginLeft: 10,
  },
  quickBudgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  quickBudgetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickBudgetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clearBudgetButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  clearBudgetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
