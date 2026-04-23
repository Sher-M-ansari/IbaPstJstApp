import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { Clock, X } from 'lucide-react-native';
import { getDBConnection, updateTopicPerformanceBatch, TopicDelta } from '../database/db';

import englishData from '../data/english.json';
import mathData from '../data/math.json';
import scienceData from '../data/science.json';
import combinedData from '../data/combined.json';

const DATA_MAP: Record<string, any[]> = {
  english: englishData,
  math: mathData,
  science: scienceData,
  combined: combinedData,
};

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const TestScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Test'>>();
  const { subject, questionCount } = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timer, setTimer] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    const rawData = DATA_MAP[subject] || [];
    let selectedQuestions = shuffleArray(rawData).slice(0, questionCount);

    selectedQuestions = selectedQuestions.map(q => ({
      ...q,
      shuffledOptions: shuffleArray(q.options)
    }));

    setQuestions(selectedQuestions);

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Exit Test', 'Are you sure you want to exit the test? Your progress will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() }
      ]);
      return true;
    });

    return () => {
      clearInterval(interval);
      backHandler.remove();
    };
  }, []);

  const handleAnswer = (option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setIsFinishing(true);
    let correct = 0;
    const wrongQuestions: any[] = [];
    const topicMap = new Map<string, TopicDelta>();

    questions.forEach((q, index) => {
      const isCorrect = selectedAnswers[index] === q.correctAnswer;
      if (isCorrect) {
        correct++;
      } else {
        wrongQuestions.push({
          ...q,
          userAnswer: selectedAnswers[index] || 'Not Answered'
        });
      }

      if (q.topic) {
        const prev = topicMap.get(q.topic) ?? { topic: q.topic, correctDelta: 0, totalDelta: 0 };
        prev.totalDelta += 1;
        if (isCorrect) prev.correctDelta += 1;
        topicMap.set(q.topic, prev);
      }
    });

    const score = (correct / questions.length) * 100;
    const result = {
      score: Math.round(score),
      totalQuestions: questions.length,
      correctAnswers: correct,
      incorrectAnswers: questions.length - correct,
      accuracy: Math.round(score),
      timeTaken: timer,
      subject,
      wrongQuestions
    };

    try {
      const db = await getDBConnection();
      await updateTopicPerformanceBatch(db, subject, Array.from(topicMap.values()));
    } catch (e) {
      console.error('Failed to persist topic performance:', e);
    }

    navigation.replace('Result', result);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <X size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.timerContainer}>
          <Clock size={18} color={theme.primary} />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.topicBadge}>{currentQuestion.topic}</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.shuffledOptions.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentIndex] === option && styles.selectedOption
              ]}
              onPress={() => handleAnswer(option)}
            >
              <View style={[
                styles.optionCircle,
                selectedAnswers[currentIndex] === option && styles.selectedOptionCircle
              ]}>
                <Text style={[
                  styles.optionLetter,
                  selectedAnswers[currentIndex] === option && styles.selectedOptionLetter
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswers[currentIndex] === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, (!selectedAnswers[currentIndex] || isFinishing) && styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedAnswers[currentIndex] || isFinishing}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: theme.surface,
    elevation: 2,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  progressText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
    fontFamily: 'monospace',
  },
  content: {
    padding: SPACING.lg,
  },
  questionCard: {
    backgroundColor: theme.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    elevation: 1,
  },
  topicBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.primary,
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedOption: {
    borderColor: theme.primary,
    backgroundColor: theme.surfaceAlt,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectedOptionCircle: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textSecondary,
  },
  selectedOptionLetter: {
    color: theme.textOnPrimary,
  },
  optionText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: theme.primary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  nextButton: {
    backgroundColor: theme.primary,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: theme.border,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textOnPrimary,
  },
});

export default TestScreen;
