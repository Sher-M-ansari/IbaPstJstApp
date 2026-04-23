import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, BarChart2, TrendingUp, Calendar, BookOpen } from 'lucide-react-native';
import { getDBConnection, getTestHistory, getTopicPerformance, TopicPerformance } from '../database/db';
import TopicPerformanceItem from '../components/TopicPerformanceItem';

const AnalyticsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [history, setHistory] = useState<any[]>([]);
  const [performance, setPerformance] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = await getDBConnection();
      const [testHistory, topicPerformance] = await Promise.all([
        getTestHistory(db),
        getTopicPerformance(db),
      ]);
      setHistory(testHistory);
      setPerformance(topicPerformance);
    } catch (e) {
      console.error('Error fetching analytics:', e);
      setError('Could not load analytics. Tap retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderHistoryItem = ({ item }: any) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historySubject}>{item.subject.toUpperCase()}</Text>
        <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.historyStats}>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatValue}>{item.score}%</Text>
          <Text style={styles.historyStatLabel}>Score</Text>
        </View>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatValue}>{item.correctAnswers}/{item.totalQuestions}</Text>
          <Text style={styles.historyStatLabel}>Correct</Text>
        </View>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatValue}>{Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s</Text>
          <Text style={styles.historyStatLabel}>Time</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <TrendingUp size={24} color={theme.primary} />
              <Text style={styles.statBoxValue}>{history.length}</Text>
              <Text style={styles.statBoxLabel}>Tests Taken</Text>
            </View>
            <View style={styles.statBox}>
              <BarChart2 size={24} color={theme.success} />
              <Text style={styles.statBoxValue}>
                {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0}%
              </Text>
              <Text style={styles.statBoxLabel}>Avg. Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topic-wise Performance</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity onPress={loadData} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : performance.length > 0 ? (
            performance.map(item => <TopicPerformanceItem key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={theme.border} />
              <Text style={styles.emptyText}>No topic data available yet. Start a test to see your progress!</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          {history.length > 0 ? (
            history.slice(0, 5).map((item, index) => (
              <View key={index}>{renderHistoryItem({ item })}</View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={theme.border} />
              <Text style={styles.emptyText}>No test history found.</Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  overviewSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    elevation: 2,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: SPACING.sm,
  },
  statBoxLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  loader: {
    padding: SPACING.xl,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: theme.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: theme.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: SPACING.sm,
  },
  historySubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
  },
  historyDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStatItem: {
    alignItems: 'center',
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  historyStatLabel: {
    fontSize: 10,
    color: theme.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: theme.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default AnalyticsScreen;
