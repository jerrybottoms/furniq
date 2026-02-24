// Auth Screen — Minimalistisch, Accent-Akzente
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signUp, signIn, signInWithGoogle } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../theme';

interface AuthScreenProps {
  route: {
    params: {
      mode: 'signin' | 'signup';
    };
  };
  navigation: any;
}

export default function AuthScreen({ route, navigation }: AuthScreenProps) {
  const { theme } = useTheme();
  const mode = route.params?.mode || 'signin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte Email und Passwort eingeben.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Fehler', 'Passwort muss mindestens 6 Zeichen haben.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) Alert.alert('Fehler', error);
        else Alert.alert('Erfolg', 'Account erstellt! Bitte Email bestätigen.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const { error } = await signIn(email, password);
        if (error) Alert.alert('Fehler', error);
        else navigation.goBack();
      }
    } catch {
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) Alert.alert('Fehler', error);
    } catch {
      Alert.alert('Fehler', 'Google Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    navigation.setParams({ mode: isSignUp ? 'signin' : 'signup' });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={[styles.brandEmoji]}>🪑</Text>
          <Text style={[styles.brandName, { color: theme.primary }]}>Furniq</Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isSignUp ? 'Account erstellen' : 'Willkommen zurück'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isSignUp
              ? 'Erstelle einen Account, um Favoriten zu speichern.'
              : 'Melde dich an, um deine Favoriten zu sehen.'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>E-Mail</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="deine@email.de"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.textMuted}
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Passwort</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor={theme.textMuted}
            />
          </View>

          {/* Primary CTA */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.primary }, loading && styles.disabled, shadows.elevated]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'Bitte warten…' : isSignUp ? 'Account erstellen' : 'Anmelden'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>oder</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: theme.card, borderColor: theme.border }, loading && styles.disabled, shadows.card]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.googleBtnIcon}>🔵</Text>
            <Text style={[styles.googleBtnText, { color: theme.text }]}>Mit Google anmelden</Text>
          </TouchableOpacity>
        </View>

        {/* Footer toggle */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {isSignUp ? 'Schon einen Account?' : 'Noch kein Account?'}
          </Text>
          <TouchableOpacity onPress={toggleMode} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>
              {isSignUp ? 'Anmelden' : 'Registrieren'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
  },

  // Brand
  brand: { alignItems: 'center', marginBottom: spacing.lg },
  brandEmoji: { fontSize: 48, marginBottom: spacing.xs },
  brandName: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },

  // Title
  titleSection: { alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 0.35, marginBottom: spacing.xs },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 21 },

  // Form
  form: { marginBottom: spacing.lg },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  primaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { marginHorizontal: spacing.sm, fontSize: 13 },

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  googleBtnIcon: { fontSize: 18 },
  googleBtnText: { fontSize: 16, fontWeight: '500' },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
