import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { ChevronLeft, Clock, X } from 'lucide-react-native';

// Import JSON data
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

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timer, setTimer] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const rawData = DATA_MAP[subject] || [];
    let selectedQuestions = shuffleArray(rawData).slice(0, questionCount);
    
    // Shuffle options for each question
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

  const finishTest = () => {
    let correct = 0;
    const wrongQuestions: any[] = [];

    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      } else {
        wrongQuestions.push({
          ...q,
          userAnswer: selectedAnswers[index] || 'Not Answered'
        });
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
          <X size={24} color={COLORS.light.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Question {currentIndex + 1} of {questions.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.timerContainer}>
          <Clock size={18} color={COLORS.primary} />
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
          style={[styles.nextButton, !selectedAnswers[currentIndex] && styles.disabledButton]} 
          onPress={handleNext}
          disabled={!selectedAnswers[currentIndex]}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.light.surface,
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
    color: COLORS.light.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.light.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  content: {
    padding: SPACING.lg,
  },
  questionCard: {
    backgroundColor: COLORS.light.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    elevation: 1,
  },
  topicBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.light.text,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectedOptionCircle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
  },
  selectedOptionLetter: {
    color: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.light.text,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.light.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: COLORS.light.border,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TestScreen;
