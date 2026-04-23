import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, ScrollView, Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { BORDER_RADIUS, SPACING, Theme } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';
import { clearAllData, getDBConnection } from '../database/db';
import { ChevronLeft, Moon, Bell, Trash2, Info, Share2 } from 'lucide-react-native';
import {
  isNotificationsEnabled,
  setNotificationsEnabledAndApply,
} from '../services/notifications';

const SettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [notificationsEnabled, setNotificationsEnabledLocal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isNotificationsEnabled()
      .then((v) => {
        if (!cancelled) setNotificationsEnabledLocal(v);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleNotifications = async (next: boolean) => {
    setNotificationsEnabledLocal(next);
    try {
      const resolved = await setNotificationsEnabledAndApply(next);
      if (resolved !== next) {
        setNotificationsEnabledLocal(resolved);
        if (next && !resolved) {
          Alert.alert(
            'Notifications blocked',
            'Please enable notifications for this app in your device settings to receive daily reminders.',
          );
        }
      }
    } catch (err) {
      console.warn('toggle notifications failed', err);
      setNotificationsEnabledLocal(!next);
    }
  };

  const SettingItem = ({ icon: Icon, title, subtitle, value, onValueChange, type = 'switch', onPress }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingIcon}>
        <Icon size={22} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: theme.switchTrackOff, true: theme.primary + '80' }}
          thumbColor={value ? theme.primary : theme.switchThumbOff}
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
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const db = await getDBConnection();
              await clearAllData(db);
              await AsyncStorage.clear();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              );
            } catch (error) {
              console.log('Clear Data Error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color={theme.text} />
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
            value={isDark}
            onValueChange={toggleTheme}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingItem
            icon={Bell}
            title="Daily Reminders"
            subtitle="Get notified to practice daily"
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary + '15',
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
    color: theme.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  chevron: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: theme.border,
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
    color: theme.textSecondary,
  },
  footerSubText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
});

export default SettingsScreen;
