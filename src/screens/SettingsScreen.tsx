// Settings Screen - Redesigned mit Apple Grouped List Style
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
import { typography, spacing, borderRadius, shadows } from '../theme';

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
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.text }}>Lädt...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.surface }]}>
      
      {/* DESIGN Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DESIGN</Text>
      <View style={[styles.section, { backgroundColor: theme.card }]}>
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

      {/* LAND Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>LAND</Text>
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.countryGrid}>
          {COUNTRIES.map((country, index) => (
            <React.Fragment key={country.code}>
              <TouchableOpacity
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
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* BENACHRICHTIGUNGEN Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>BENACHRICHTIGUNGEN</Text>
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        
        <View style={[styles.row, { borderBottomColor: theme.separator }]}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Benachrichtigungen</Text>
            <Text style={[styles.rowDescription, { color: theme.textSecondary }]}>
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

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('PriceAlerts')}
        >
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>🔔 Preis-Alarme</Text>
            <Text style={[styles.rowDescription, { color: theme.textSecondary }]}>
              Verwalte deine Preisbenachrichtigungen
            </Text>
          </View>
          <Text style={[styles.arrow, { color: theme.textTertiary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* BUDGET Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>BUDGET</Text>
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        
        <View style={[styles.row, { borderBottomColor: theme.separator }]}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>Budget-Filter aktivieren</Text>
            <Text style={[styles.rowDescription, { color: theme.textSecondary }]}>
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
                placeholderTextColor={theme.textTertiary}
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

      {/* ÜBER Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>ÜBER</Text>
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: theme.separator }]}
          onPress={() => openLink('https://example.com/datenschutz')}
        >
          <Text style={[styles.linkText, { color: theme.text }]}>Datenschutzerklärung</Text>
          <Text style={[styles.arrow, { color: theme.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { borderBottomColor: theme.separator }]}
          onPress={() => openLink('https://example.com/impressum')}
        >
          <Text style={[styles.linkText, { color: theme.text }]}>Impressum</Text>
          <Text style={[styles.arrow, { color: theme.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={resetData}>
          <Text style={styles.linkTextDanger}>Einstellungen zurücksetzen</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.version}>
        <Text style={[styles.versionText, { color: theme.textTertiary }]}>Furniq v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Section Title (outside the card, uppercase, Apple style)
  sectionTitle: {
    ...typography.footnote,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: spacing.md + spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  // Section Card (Apple grouped list style)
  section: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  // Row within section
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.body,
  },
  rowDescription: {
    ...typography.footnote,
    marginTop: 2,
  },
  // Arrow
  arrow: {
    ...typography.body,
    marginLeft: spacing.xs,
  },
  // Link row
  linkText: {
    ...typography.body,
    flex: 1,
  },
  linkTextDanger: {
    ...typography.body,
    color: '#FF3B30',
  },
  
  // Theme Mode Buttons
  themeModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  themeModeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.sm + 4,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
  },
  themeModeIcon: {
    fontSize: 24,
    marginBottom: spacing.xxs,
  },
  themeModeLabel: {
    ...typography.footnote,
    fontWeight: '600',
  },
  
  // Country Buttons
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  countryButton: {
    width: '31%',
    padding: spacing.sm,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
  },
  countryFlag: {
    fontSize: 28,
    marginBottom: spacing.xxs,
  },
  countryName: {
    ...typography.caption1,
    fontWeight: '500',
    textAlign: 'center',
  },
  countryCurrency: {
    ...typography.caption2,
    marginTop: 2,
  },
  
  // Budget Styles
  budgetInputContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  budgetLabel: {
    ...typography.footnote,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  budgetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetInput: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.sm + 2,
    ...typography.body,
    borderWidth: 1,
  },
  budgetSuffix: {
    ...typography.body,
    marginLeft: spacing.xs + spacing.xxs,
  },
  quickBudgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm + 4,
  },
  quickBudgetButton: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  quickBudgetText: {
    ...typography.footnote,
    fontWeight: '500',
  },
  clearBudgetButton: {
    marginTop: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  clearBudgetText: {
    ...typography.footnote,
    fontWeight: '600',
  },
  
  // Version footer
  version: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    marginTop: spacing.lg,
  },
  versionText: {
    ...typography.caption1,
  },
});
