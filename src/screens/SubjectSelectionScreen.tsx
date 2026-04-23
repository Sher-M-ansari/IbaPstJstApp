import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Book, Calculator, FlaskConical, Layers } from 'lucide-react-native';

const buildSubjects = (theme: Theme) => [
  { id: 'english', title: 'English', icon: Book, color: theme.subjects.english },
  { id: 'math', title: 'Math', icon: Calculator, color: theme.subjects.math },
  { id: 'science', title: 'Science', icon: FlaskConical, color: theme.subjects.science },
  { id: 'combined', title: 'Combined Test', icon: Layers, color: theme.subjects.combined },
];

const SubjectSelectionScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const subjects = useMemo(() => buildSubjects(theme), [theme]);

  const renderSubject = ({ item }: any) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        style={[styles.subjectCard, { borderLeftColor: item.color }]}
        onPress={() => navigation.navigate('TestSetup', { subject: item.id })}
      >
        <View style={[styles.iconWrapper, { backgroundColor: item.color + '15' }]}>
          <Icon size={24} color={item.color} />
        </View>
        <Text style={styles.subjectTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Subject</Text>
      </View>

      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
});

export default SubjectSelectionScreen;
