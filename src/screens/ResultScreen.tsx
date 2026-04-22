import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { CheckCircle, XCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react-native';
import { getDBConnection, saveTestResult, updateTopicPerformance } from '../database/db';

const ResultScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const result = route.params;

  useEffect(() => {
    const saveResult = async () => {
      try {
        const db = await getDBConnection();
        await saveTestResult(db, {
          subject: result.subject,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          incorrectAnswers: result.incorrectAnswers,
          accuracy: result.accuracy,
          timeTaken: result.timeTaken
        });

        // Update topic performance for each question (simplified logic here)
        // In a real app, we'd pass all questions and their results
      } catch (error) {
        console.error("Error saving result:", error);
      }
    };
    saveResult();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const StatCard = ({ label, value, color }: any) => (
    <View style={[styles.statCard, { borderBottomColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Test Result</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{result.score}%</Text>
            <Text style={styles.scoreLabel}>Total Score</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Correct" value={result.correctAnswers} color={COLORS.success} />
          <StatCard label="Incorrect" value={result.incorrectAnswers} color={COLORS.error} />
          <StatCard label="Accuracy" value={`${result.accuracy}%`} color={COLORS.primary} />
          <StatCard label="Time Taken" value={formatTime(result.timeTaken)} color="#9C27B0" />
        </View>

        {result.wrongQuestions.length > 0 && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Review Mistakes</Text>
            {result.wrongQuestions.map((q, index) => (
              <View key={index} style={styles.wrongQuestionCard}>
                <Text style={styles.wrongQuestionText}>{q.question}</Text>
                <View style={styles.answerRow}>
                  <XCircle size={16} color={COLORS.error} />
                  <Text style={styles.userAnswerText}>Your: {q.userAnswer}</Text>
                </View>
                <View style={styles.answerRow}>
                  <CheckCircle size={16} color={COLORS.success} />
                  <Text style={styles.correctAnswerText}>Correct: {q.correctAnswer}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.retakeButton} 
            onPress={() => navigation.replace('TestSetup', { subject: result.subject })}
          >
            <RotateCcw size={20} color="#FFFFFF" />
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => navigation.navigate('Home')}
          >
            <Home size={20} color={COLORS.primary} />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SPACING.lg,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.light.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderBottomWidth: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  reviewSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SPACING.md,
  },
  wrongQuestionCard: {
    backgroundColor: COLORS.light.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  wrongQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SPACING.sm,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  userAnswerText: {
    fontSize: 14,
    color: COLORS.error,
  },
  correctAnswerText: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
  },
  actionButtons: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  retakeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    elevation: 4,
  },
  retakeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default ResultScreen;
