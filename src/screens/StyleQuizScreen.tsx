// Style Quiz Screen - Redesigned mit Apple Style
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { QUIZ_QUESTIONS, calculateQuizResult } from '../data/quizQuestions';
import { StyleProfileService } from '../services/styleProfile';
import { QuizAnswer, FurnitureStyle, QuizResult } from '../types';
import QuizOption from '../components/QuizOption';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../theme';

type RootStackParamList = {
  MainTabs: undefined;
  StyleQuiz: undefined;
  Discover: undefined;
};

const { width } = Dimensions.get('window');

type QuizState = 'intro' | 'question' | 'result';

export default function StyleQuizScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [state, setState] = useState<QuizState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<FurnitureStyle | null>(null);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progress = (currentQuestion + 1) / totalQuestions;

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = [...answers, { questionId: question.id, selectedOption: optionKey }];
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 200);
    } else {
      const calculatedStyle = calculateQuizResult(newAnswers);
      setResult(calculatedStyle);
      const quizResult: QuizResult = {
        style: calculatedStyle,
        answers: newAnswers,
        timestamp: Date.now(),
      };
      StyleProfileService.saveQuizResult(quizResult);
      setState('result');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      setState('intro');
    }
  };

  const handleRestart = () => {
    setState('intro');
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const handleViewProducts = () => {
    navigation.navigate('MainTabs', { screen: 'Discover' });
  };

  // ══════════════════════════════
  //  INTRO
  // ══════════════════════════════
  if (state === 'intro') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.introContainer, { padding: spacing.xl }]}>
          {/* Hero */}
          <View style={[styles.introHero, { backgroundColor: theme.primaryLight }]}>
            <Text style={styles.introEmoji}>💡</Text>
          </View>

          <View style={styles.introBody}>
            <Text style={[styles.introTitle, { color: theme.primary }]}>Finde deinen{'\n'}Einrichtungsstil</Text>
            <Text style={[styles.introSub, { color: theme.textSecondary, lineHeight: 24 }]}>
              Beantworte 5 kurze Fragen und entdecke, welcher Einrichtungsstil am besten zu dir passt.
            </Text>

            <View style={[styles.featureBox, { backgroundColor: theme.surface }]}>
              {[
                { icon: '❓', text: '5 einfache Fragen' },
                { icon: '🎯', text: 'Persönliche Empfehlungen' },
                { icon: '⚡', text: 'In nur 2 Minuten' },
              ].map((f) => (
                <View 
                  key={f.text} 
                  style={[styles.featureRow, { marginBottom: spacing.md, paddingHorizontal: spacing.lg }]}
                >
                  <Text style={[styles.featureIcon, { fontSize: 24 }]}>{f.icon}</Text>
                  <Text style={[styles.featureText, { color: theme.text }]}>{f.text}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.startBtn, 
                { 
                  backgroundColor: theme.primary, 
                  borderRadius: borderRadius.full,
                  paddingVertical: spacing.md,
                }, 
                shadows.elevated
              ]}
              onPress={() => setState('question')}
              activeOpacity={0.85}
            >
              <Text style={[styles.startBtnText, typography.headline]}>Quiz starten</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════
  //  RESULT
  // ══════════════════════════════
  if (state === 'result') {
    const styleEmojis: Record<FurnitureStyle, string> = {
      'Skandinavisch': '🌿',
      'Modern': '✨',
      'Industrial': '🔧',
      'Vintage': '🏺',
      'Boho': '🌸',
      'Minimalistisch': '⬜',
    };
    const styleDescriptions: Record<FurnitureStyle, string> = {
      'Skandinavisch': 'Du liebst helle, natürliche Materialien und ein gemütliches, aber aufgeräumtes Zuhause.',
      'Modern': 'Du schätzt klare Linien, elegante Materialien und zeitloses Design.',
      'Industrial': 'Du magst es rustikal, authentisch und mit echtem Charakter.',
      'Vintage': 'Du schätzt klassische Stücke mit Geschichte und warmer Atmosphäre.',
      'Boho': 'Du liebst kreative Kombinationen, natürliche Materialien und einen lockeren Look.',
      'Minimalistisch': 'Weniger ist mehr – du schätzt Funktionalität und reduzierte Ästhetik.',
    };

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView 
          contentContainerStyle={[styles.resultContainer, { padding: spacing.xl }]} 
          showsVerticalScrollIndicator={false}
        >
          {/* Result hero */}
          <View style={[styles.resultHero, { backgroundColor: theme.primaryLight }]}>
            <Text style={styles.resultEmoji}>{styleEmojis[result || 'Modern']}</Text>
          </View>

          <View style={styles.resultBody}>
            <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>Dein Stil ist</Text>
            <Text style={[styles.resultStyle, { color: theme.primary }]}>{result}</Text>
            <Text style={[styles.resultDesc, { color: theme.text, lineHeight: 24 }]}>
              {styleDescriptions[result || 'Modern']}
            </Text>

            <View style={[styles.savedBadge, { backgroundColor: theme.primaryLight, borderRadius: borderRadius.medium, padding: spacing.md }]}>
              <Text style={[styles.savedBadgeText, { color: theme.primary }]}>
                ✓ Stil gespeichert für personalisierte Empfehlungen
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.viewBtn, 
                { 
                  backgroundColor: theme.primary, 
                  borderRadius: borderRadius.full,
                  paddingVertical: spacing.md,
                }, 
                shadows.elevated
              ]}
              onPress={handleViewProducts}
              activeOpacity={0.85}
            >
              <Text style={[styles.viewBtnText, typography.headline]}>Passende Produkte entdecken</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
              <Text style={[styles.restartBtnText, { color: theme.textTertiary }]}>Quiz wiederholen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════
  //  QUESTION
  // ══════════════════════════════
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress header */}
      <View style={[styles.questionHeader, { 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderBottomColor: theme.separator 
      }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          {/* Progress bar */}
          <View style={[styles.progressTrack, { 
            backgroundColor: theme.separator, 
            height: 6, 
            borderRadius: borderRadius.small 
          }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>
            {currentQuestion + 1} / {totalQuestions}
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.questionContent, { padding: spacing.lg }]} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.questionText, { color: theme.primary }]}>{question.question}</Text>
        {question.subtitle && (
          <Text style={[styles.questionSub, { color: theme.textSecondary }]}>{question.subtitle}</Text>
        )}

        <View style={[styles.optionsGrid, { gap: spacing.sm }]}>
          {question.options.map((option) => (
            <QuizOption
              key={option.key}
              imageUrl={option.imageUrl}
              label={option.label}
              isSelected={
                answers.length > 0 &&
                answers[answers.length - 1]?.questionId === question.id &&
                answers[answers.length - 1]?.selectedOption === option.key
              }
              onPress={() => handleSelectOption(option.key)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Intro
  introContainer: { flex: 1 },
  introHero: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  introEmoji: { fontSize: 64 },
  introBody: { flex: 1, justifyContent: 'center' },
  introTitle: { ...typography.title1, marginBottom: spacing.sm },
  introSub: { ...typography.body, marginBottom: spacing.lg },
  featureBox: { borderRadius: borderRadius.large, padding: spacing.md, marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { marginRight: spacing.sm, width: 28 },
  featureText: { ...typography.body },
  startBtn: {
    alignItems: 'center',
  },
  startBtnText: { color: '#FFF' },

  // Result
  resultContainer: { paddingBottom: spacing.xxxl },
  resultHero: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  resultEmoji: { fontSize: 72 },
  resultBody: { alignItems: 'center', marginTop: spacing.lg },
  resultLabel: { ...typography.body, marginBottom: spacing.xs },
  resultStyle: { ...typography.largeTitle, marginBottom: spacing.sm },
  resultDesc: { ...typography.body, textAlign: 'center', marginBottom: spacing.lg },
  savedBadge: {
    marginBottom: spacing.lg,
  },
  savedBadgeText: { ...typography.subhead, textAlign: 'center' },
  viewBtn: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewBtnText: { color: '#FFF' },
  restartBtn: { paddingVertical: spacing.sm },
  restartBtnText: { ...typography.subhead },

  // Question
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { ...typography.title2 },
  progressWrap: { flex: 1, marginLeft: spacing.sm },
  progressTrack: {
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  progressLabel: { ...typography.caption1, marginTop: 4, textAlign: 'right' },
  questionContent: {},
  questionText: { ...typography.title2, textAlign: 'center', marginBottom: spacing.xs },
  questionSub: { ...typography.subhead, textAlign: 'center', marginBottom: spacing.lg },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
