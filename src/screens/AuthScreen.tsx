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

interface AuthScreenProps {
  route: {
    params: {
      mode: 'signin' | 'signup';
    };
  };
  navigation: any;
}

export default function AuthScreen({ route, navigation }: AuthScreenProps) {
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
        const { user, error } = await signUp(email, password);
        if (error) {
          Alert.alert('Fehler', error);
        } else {
          Alert.alert('Erfolg', 'Account erstellt! Bitte Email bestätigen.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        const { user, error } = await signIn(email, password);
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isSignUp ? 'Account erstellen' : 'Anmelden'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Erstelle einen Account, um Favoriten zu speichern.'
              : 'Melde dich an, um deine Favoriten zu sehen.'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="deine@email.de"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passwort</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
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
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>oder</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>Mit Google anmelden</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isSignUp ? 'Schon einen Account?' : 'Noch kein Account?'}
          </Text>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={styles.footerLink}>
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
    backgroundColor: '#FFF',
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
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#1A5F5A',
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
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 12,
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#1A5F5A',
    fontSize: 14,
    fontWeight: '600',
  },
});
