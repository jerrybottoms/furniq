// Auth Screen - Phase 5d
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
import { signUp, signIn, signInWithGoogle } from '../services/supabase';
import { useTheme } from '../context/ThemeContext';

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
        if (error) {
          Alert.alert('Fehler', error);
        } else {
          Alert.alert('Erfolg', 'Account erstellt! Bitte Email bestätigen.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Fehler', error);
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Fehler', error);
      }
      // OAuth redirect will handle the rest
    } catch (error) {
      Alert.alert('Fehler', 'Google Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    navigation.setParams({
      mode: isSignUp ? 'signin' : 'signup',
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {isSignUp ? 'Account erstellen' : 'Anmelden'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isSignUp
              ? 'Erstelle einen Account, um Favoriten zu speichern.'
              : 'Melde dich an, um deine Favoriten zu sehen.'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="deine@email.de"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Passwort</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor={theme.placeholder}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Bitte warten...'
                : isSignUp
                ? 'Account erstellen'
                : 'Anmelden'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>oder</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={[styles.googleButtonText, { color: theme.text }]}>Mit Google anmelden</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {isSignUp ? 'Schon einen Account?' : 'Noch kein Account?'}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>
              {isSignUp ? 'Hier anmelden' : 'Hier registrieren'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
  },
  googleButton: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
