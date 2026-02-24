// Onboarding Screen - Redesigned mit Apple Style
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@furniture_finder_onboarding_seen';

interface OnboardingPage {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    emoji: '📸',
    title: 'Fotografieren',
    description: 'Mach ein Foto von Möbeln oder lade Screenshots aus Einrichtungs-Shops hoch.',
  },
  {
    id: '2',
    emoji: '🔍',
    title: 'KI-Analyse',
    description: 'Wir erkennen Stil, Material und Kategorie deines Möbelstücks.',
  },
  {
    id: '3',
    emoji: '🛒',
    title: 'Vergleichen',
    description: 'Finde ähnliche Produkte mit Preisen von verschiedenen Shops.',
  },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete onboarding
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => (
    <View style={styles.page}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dots}>
      {PAGES.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex
              ? [styles.dotActive, { backgroundColor: theme.primary }]
              : { backgroundColor: theme.separator },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>Überspringen</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={styles.list}
      />

      {renderDots()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>
            {currentIndex === PAGES.length - 1 ? 'Loslegen!' : 'Weiter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.xs,
  },
  skipText: {
    ...typography.subhead,
  },
  list: {
    flex: 1,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.title1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: spacing.xxs,
  },
  dotActive: {},
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + 10,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.headline,
  },
});
