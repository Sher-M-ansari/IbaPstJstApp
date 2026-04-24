import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BORDER_RADIUS, SPACING, Theme, font, DIM } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { TopicPerformance } from '../database/db';

type Props = { item: TopicPerformance };

const TopicPerformanceItem: React.FC<Props> = ({ item }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const accuracy = item.totalCount > 0
    ? Math.round((item.correctCount / item.totalCount) * 100)
    : 0;
  const clamped = Math.min(100, Math.max(0, accuracy));
  const barColor =
    accuracy > 70 ? theme.success :
    accuracy > 40 ? theme.warning :
                    theme.error;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{item.topic}</Text>
          <Text style={styles.subjectBadge}>{item.subject.toUpperCase()}</Text>
        </View>
        <Text style={styles.accuracy}>{accuracy}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.stats}>{item.correctCount} correct out of {item.totalCount} questions</Text>
    </View>
  );
};

export default React.memo(TopicPerformanceItem);

const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  name: {
    fontSize: font.md,
    fontWeight: '600',
    color: theme.text,
    flexShrink: 1,
  },
  subjectBadge: {
    fontSize: font.xs,
    fontWeight: 'bold',
    color: theme.primary,
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  accuracy: {
    fontSize: font.md,
    fontWeight: 'bold',
    color: theme.primary,
    marginLeft: SPACING.sm,
  },
  progressBar: {
    height: DIM.progressBarThick,
    backgroundColor: theme.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  stats: {
    fontSize: font.xs,
    color: theme.textSecondary,
  },
});
