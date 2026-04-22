import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { ChevronLeft, Book, Calculator, FlaskConical, Layers } from 'lucide-react-native';

const SUBJECTS = [
  { id: 'english', title: 'English', icon: Book, color: '#4A90E2' },
  { id: 'math', title: 'Math', icon: Calculator, color: '#F5A623' },
  { id: 'science', title: 'Science', icon: FlaskConical, color: '#7ED321' },
  { id: 'combined', title: 'Combined Test', icon: Layers, color: '#9013FE' },
];

const SubjectSelectionScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
          <ChevronLeft size={28} color={COLORS.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Subject</Text>
      </View>

      <FlatList
        data={SUBJECTS}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    color: COLORS.light.text,
  },
});

export default SubjectSelectionScreen;
