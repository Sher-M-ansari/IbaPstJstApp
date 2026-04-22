import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { ChevronLeft, Moon, Bell, Trash2, Info, Share2 } from 'lucide-react-native';

const SettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const SettingItem = ({ icon: Icon, title, subtitle, value, onValueChange, type = 'switch', onPress }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingIcon}>
        <Icon size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.light.border, true: COLORS.primary + '80' }}
          thumbColor={value ? COLORS.primary : '#f4f3f4'}
        />
      ) : (
        <View style={styles.chevron} />
      )}
    </TouchableOpacity>
  );

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all test history and analytics? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => console.log("Data cleared") }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={COLORS.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem 
            icon={Moon} 
            title="Dark Mode" 
            subtitle="Switch to dark theme" 
            value={isDarkMode} 
            onValueChange={setIsDarkMode} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem 
            icon={Bell} 
            title="Daily Reminders" 
            subtitle="Get notified to practice daily" 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <SettingItem 
            icon={Trash2} 
            title="Clear History" 
            subtitle="Delete all test results" 
            type="button"
            onPress={handleClearData}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem 
            icon={Info} 
            title="App Version" 
            subtitle="1.0.0" 
            type="button"
          />
          <SettingItem 
            icon={Share2} 
            title="Share App" 
            subtitle="Invite friends to practice" 
            type="button"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>IBA PST JST Test Preparation</Text>
          <Text style={styles.footerSubText}>Made for Excellence</Text>
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 2,
  },
  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.light.border,
    transform: [{ rotate: '45deg' }],
  },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.light.textSecondary,
  },
  footerSubText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    marginTop: 4,
  },
});

export default SettingsScreen;
