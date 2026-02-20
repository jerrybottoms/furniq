// Style Quiz Screen - Interaktiver Stil-Fragebogen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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

type RootStackParamList = {
  MainTabs: undefined;
  StyleQuiz: undefined;
  Discover: undefined;
};

const { width } = Dimensions.get('window');
const OPTION_WIDTH = (width - 48) / 2;

type QuizState = 'intro' | 'question' | 'result';

export default function StyleQuizScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [state, setState] = useState<QuizState>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<FurnitureStyle | null>(null);

  const question = QUIZ_QUESTIONS[currentQuestion];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = [...answers, { questionId: question.id, selectedOption: optionKey }];
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      // Next question
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 200);
    } else {
      // Calculate result
      const calculatedStyle = calculateQuizResult(newAnswers);
      setResult(calculatedStyle);
      
      // Save result
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

  // ========== INTRO SCREEN ==========
  if (state === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.introContainer}>
          <Text style={styles.introEmoji}>💡</Text>
          <Text style={styles.introTitle}>Finde deinen Einrichtungsstil</Text>
          <Text style={styles.introSubtitle}>
            Beantworte 5 kurze Fragen und entdecke, welcher Einrichtungsstil am besten zu dir passt.
          </Text>
          
          <View style={styles.introFeatures}>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>❓</Text>
              <Text style={styles.featureText}>5 einfache Fragen</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>🎯</Text>
              <Text style={styles.featureText}>Persönliche Empfehlungen</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureText}>In nur 2 Minuten</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setState('question')}
          >
            <Text style={styles.startButtonText}>Quiz starten</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========== RESULT SCREEN ==========
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
      'Industrial': 'Du magst es rustikal, authentisch und动手 mit Charakter.',
      'Vintage': 'Du schätzt klassische Stücke mit Geschichte und warmer Atmosphäre.',
      'Boho': 'Du liebst kreative Kombinationen, natürliche Materialien und einen lockeren Look.',
      'Minimalistisch': 'Weniger ist mehr – du schätzt Funktionalität und reduzierte Ästhetik.',
    };

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{styleEmojis[result || 'Modern']}</Text>
          <Text style={styles.resultTitle}>Dein Stil ist</Text>
          <Text style={styles.resultStyle}>{result}</Text>
          <Text style={styles.resultDescription}>
            {styleDescriptions[result || 'Modern']}
          </Text>

          <View style={styles.resultBadge}>
            <Text style={styles.resultBadgeText}>
              ✓ Stil gespeichert für personalisierte Empfehlungen
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewProductsButton}
            onPress={handleViewProducts}
          >
            <Text style={styles.viewProductsButtonText}>
              Passende Produkte entdecken
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRestart}
          >
            <Text style={styles.restartButtonText}>Quiz wiederholen</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ========== QUESTION SCREEN ==========
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Frage {currentQuestion + 1} von {totalQuestions}
          </Text>
        </View>
      </View>

      {/* Question */}
      <ScrollView contentContainerStyle={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        {question.subtitle && (
          <Text style={styles.subtitleText}>{question.subtitle}</Text>
        )}

        {/* Options Grid */}
        <View style={styles.optionsGrid}>
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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  
  // Intro Styles
  introContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  introEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A5F5A',
    textAlign: 'center',
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  introFeatures: {
    width: '100%',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  startButton: {
    backgroundColor: '#1A5F5A',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Question Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1A5F5A',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1A5F5A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A5F5A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Result Styles
  resultContainer: {
    padding: 24,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  resultStyle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A5F5A',
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  resultBadge: {
    backgroundColor: '#E8F5F4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  resultBadgeText: {
    color: '#1A5F5A',
    fontSize: 14,
    textAlign: 'center',
  },
  viewProductsButton: {
    backgroundColor: '#1A5F5A',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    marginBottom: 16,
  },
  viewProductsButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  restartButton: {
    paddingVertical: 12,
  },
  restartButtonText: {
    color: '#999',
    fontSize: 16,
  },
});
