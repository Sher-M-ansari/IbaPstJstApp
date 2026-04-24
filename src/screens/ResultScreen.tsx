import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme, font, ICON, DIM } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, XCircle, RotateCcw, Home } from 'lucide-react-native';
import { getDBConnection, saveTestResult } from '../database/db';
import { rescheduleAll } from '../services/notifications';

const ResultScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const result = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        rescheduleAll().catch((err) =>
          console.warn('[notifications] post-test reschedule failed', err),
        );
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
          <StatCard label="Correct" value={result.correctAnswers} color={theme.success} />
          <StatCard label="Incorrect" value={result.incorrectAnswers} color={theme.error} />
          <StatCard label="Accuracy" value={`${result.accuracy}%`} color={theme.primary} />
          <StatCard label="Time Taken" value={formatTime(result.timeTaken)} color={theme.accentPurple} />
        </View>

        {result.wrongQuestions.length > 0 && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Review Mistakes</Text>
            {result.wrongQuestions.map((q, index) => (
              <View key={index} style={styles.wrongQuestionCard}>
                <Text style={styles.wrongQuestionText}>{q.question}</Text>
                <View style={styles.answerRow}>
                  <XCircle size={ICON.sm} color={theme.error} />
                  <Text style={styles.userAnswerText}>Your: {q.userAnswer}</Text>
                </View>
                <View style={styles.answerRow}>
                  <CheckCircle size={ICON.sm} color={theme.success} />
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
            <RotateCcw size={ICON.md} color={theme.textOnPrimary} />
            <Text style={styles.retakeButtonText}>Retake Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Home size={ICON.md} color={theme.primary} />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: font.xxl,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SPACING.lg,
  },
  scoreCircle: {
    width: DIM.scoreCircle,
    height: DIM.scoreCircle,
    borderRadius: DIM.scoreCircle / 2,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scoreValue: {
    fontSize: font.hero,
    fontWeight: 'bold',
    color: theme.textOnPrimary,
  },
  scoreLabel: {
    fontSize: font.sm,
    color: theme.textOnPrimary,
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
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderBottomWidth: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: font.xl,
    fontWeight: 'bold',
    color: theme.text,
  },
  statLabel: {
    fontSize: font.xs,
    color: theme.textSecondary,
    marginTop: SPACING.xs,
  },
  reviewSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SPACING.md,
  },
  wrongQuestionCard: {
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  wrongQuestionText: {
    fontSize: font.md,
    fontWeight: '600',
    color: theme.text,
    marginBottom: SPACING.sm,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  userAnswerText: {
    fontSize: font.sm,
    color: theme.error,
  },
  correctAnswerText: {
    fontSize: font.sm,
    color: theme.success,
    fontWeight: '600',
  },
  actionButtons: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  retakeButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    height: DIM.button,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    elevation: 4,
  },
  retakeButtonText: {
    fontSize: font.lg,
    fontWeight: 'bold',
    color: theme.textOnPrimary,
  },
  homeButton: {
    backgroundColor: theme.surface,
    flexDirection: 'row',
    height: DIM.button,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  homeButtonText: {
    fontSize: font.lg,
    fontWeight: 'bold',
    color: theme.primary,
  },
});

export default ResultScreen;
