import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme, font, ICON, DIM } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Play } from 'lucide-react-native';

const QUESTION_COUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const TestSetupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TestSetup'>>();
  const { subject } = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedCount, setSelectedCount] = useState(10);

  const handleStartTest = () => {
    navigation.navigate('Test', { subject, questionCount: selectedCount });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={ICON.xl} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Setup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectLabel}>Selected Subject</Text>
          <Text style={styles.subjectValue}>{subject.charAt(0).toUpperCase() + subject.slice(1)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Number of Questions</Text>
        <View style={styles.grid}>
          {QUESTION_COUNTS.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.countButton,
                selectedCount === count && styles.selectedCountButton
              ]}
              onPress={() => setSelectedCount(count)}
            >
              <Text style={[
                styles.countText,
                selectedCount === count && styles.selectedCountText
              ]}>
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionText}>• Each question has 4 options.</Text>
          <Text style={styles.instructionText}>• Only one option is correct.</Text>
          <Text style={styles.instructionText}>• Questions and options are shuffled.</Text>
          <Text style={styles.instructionText}>• Your progress will be tracked.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Text style={styles.startButtonText}>Start Test</Text>
          <Play size={ICON.md} color={theme.textOnPrimary} fill={theme.textOnPrimary} />
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
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: font.xxl,
    fontWeight: 'bold',
    color: theme.text,
  },
  content: {
    padding: SPACING.lg,
  },
  subjectInfo: {
    backgroundColor: theme.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    elevation: 2,
  },
  subjectLabel: {
    fontSize: font.sm,
    color: theme.textSecondary,
    marginBottom: SPACING.xs,
  },
  subjectValue: {
    fontSize: font.xl,
    fontWeight: 'bold',
    color: theme.primary,
  },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  countButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: theme.surface,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedCountButton: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  countText: {
    fontSize: font.md,
    fontWeight: '600',
    color: theme.text,
  },
  selectedCountText: {
    color: theme.textOnPrimary,
  },
  instructions: {
    backgroundColor: theme.surfaceAlt,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  instructionTitle: {
    fontSize: font.md,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: font.sm,
    color: theme.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: font.xl,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  startButton: {
    backgroundColor: theme.primary,
    flexDirection: 'row',
    height: DIM.button,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    elevation: 4,
  },
  startButtonText: {
    fontSize: font.lg,
    fontWeight: 'bold',
    color: theme.textOnPrimary,
  },
});

export default TestSetupScreen;
