import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { ChevronLeft, BarChart2, TrendingUp, Calendar, BookOpen } from 'lucide-react-native';
import { getDBConnection, getTestHistory, getTopicPerformance } from '../database/db';

const AnalyticsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [history, setHistory] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = await getDBConnection();
        const testHistory = await getTestHistory(db);
        const topicPerformance = await getTopicPerformance(db);
        setHistory(testHistory);
        setPerformance(topicPerformance);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const renderTopicPerformance = (item: any) => {
    const accuracy = Math.round((item.correctCount / item.totalCount) * 100);
    return (
      <View key={item.id} style={styles.topicCard}>
        <View style={styles.topicHeader}>
          <Text style={styles.topicName}>{item.topic}</Text>
          <Text style={styles.topicAccuracy}>{accuracy}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${accuracy}%`, backgroundColor: accuracy > 70 ? COLORS.success : accuracy > 40 ? COLORS.warning : COLORS.error }]} />
        </View>
        <Text style={styles.topicStats}>{item.correctCount} correct out of {item.totalCount} questions</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={COLORS.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <TrendingUp size={24} color={COLORS.primary} />
              <Text style={styles.statBoxValue}>{history.length}</Text>
              <Text style={styles.statBoxLabel}>Tests Taken</Text>
            </View>
            <View style={styles.statBox}>
              <BarChart2 size={24} color={COLORS.success} />
              <Text style={styles.statBoxValue}>
                {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0}%
              </Text>
              <Text style={styles.statBoxLabel}>Avg. Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topic-wise Performance</Text>
          {performance.length > 0 ? (
            performance.map(renderTopicPerformance)
          ) : (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={COLORS.light.border} />
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
              <Calendar size={48} color={COLORS.light.border} />
              <Text style={styles.emptyText}>No test history found.</Text>
            </View>
          )}
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
    color: COLORS.light.text,
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
    color: COLORS.light.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.light.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    elevation: 2,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginTop: SPACING.sm,
  },
  statBoxLabel: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  topicCard: {
    backgroundColor: COLORS.light.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  topicAccuracy: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  topicStats: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
  },
  historyCard: {
    backgroundColor: COLORS.light.surface,
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
    borderBottomColor: COLORS.light.border,
    paddingBottom: SPACING.sm,
  },
  historySubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
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
    color: COLORS.light.text,
  },
  historyStatLabel: {
    fontSize: 10,
    color: COLORS.light.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.light.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default AnalyticsScreen;
