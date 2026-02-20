// Main App Entry Point - Feature 7: Discover + Bottom Tabs
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import AuthScreen from './src/screens/AuthScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import StyleQuizScreen from './src/screens/StyleQuizScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Results: {
    image: string;
    analysis: any;
    products: any[];
  };
  Auth: {
    mode: 'signin' | 'signup';
  };
  StyleQuiz: undefined;
  ProductDetail: { productId: string };
};

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Favorites: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const ONBOARDING_KEY = '@furniq_onboarding_seen';

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1A5F5A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#1A5F5A',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Furniq',
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          title: 'Entdecken',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoriten',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>❤️</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if onboarding was already shown
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setShowOnboarding(val === 'true');
    });
  }, []);

  if (showOnboarding === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1A5F5A" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1A5F5A',
            },
            headerTintColor: '#FFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              title: 'Ähnliche Produkte',
              headerBackTitle: 'Zurück',
            }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              title: 'Anmelden',
              headerBackTitle: 'Zurück',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="StyleQuiz"
            component={StyleQuizScreen}
            options={{
              title: 'Style Quiz',
              headerBackTitle: 'Zurück',
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
