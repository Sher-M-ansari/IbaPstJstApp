import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, BarChart2, Settings, Play } from 'lucide-react-native';
import { getDBConnection, getTestHistory } from '../database/db';

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [testsTaken, setTestsTaken] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const db = await getDBConnection();
          const history = await getTestHistory(db);
          setTestsTaken(history.length);
          setAvgAccuracy(
            history.length > 0
              ? Math.round(history.reduce((a, c) => a + c.score, 0) / history.length)
              : 0
          );
        } catch (e) {
          console.error('Error loading home stats:', e);
        }
      };
      loadStats();
    }, [])
  );

  const MenuCard = ({ title, icon: Icon, onPress, color }: any) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={28} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>Tap to explore</Text>
      </View>
      <Play size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to</Text>
          <Text style={styles.appName}>IBA PST JST Prep</Text>
        </View>

        <View style={styles.menuGrid}>
          <MenuCard
            title="Start Test"
            icon={BookOpen}
            onPress={() => navigation.navigate('SubjectSelection')}
            color={theme.primary}
          />
          <MenuCard
            title="Analytics"
            icon={BarChart2}
            onPress={() => navigation.navigate('Analytics')}
            color={theme.accentPurple}
          />
          <MenuCard
            title="Settings"
            icon={Settings}
            onPress={() => navigation.navigate('Settings')}
            color={theme.accentSlate}
          />
        </View>

        <View style={styles.statsOverview}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{testsTaken}</Text>
              <Text style={styles.statLabel}>Tests Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgAccuracy}%</Text>
              <Text style={styles.statLabel}>Avg. Accuracy</Text>
            </View>
          </View>
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
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  greeting: {
    fontSize: 18,
    color: theme.textSecondary,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
  },
  menuGrid: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  statsOverview: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
});

export default HomeScreen;
