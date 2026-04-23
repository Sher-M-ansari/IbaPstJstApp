import React, { useEffect, useMemo } from 'react';
import { StatusBar, LogBox } from 'react-native';
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getDBConnection, createTables } from './src/database/db';
import { initNotifications } from './src/services/notifications';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

LogBox.ignoreLogs(['Reanimated 2']);

const AppShell = () => {
  const { theme, isDark } = useTheme();

  const navigationTheme = useMemo<NavTheme>(() => {
    const base = isDark ? NavDarkTheme : NavDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.background,
        card: theme.surface,
        text: theme.text,
        border: theme.border,
        primary: theme.primary,
      },
    };
  }, [isDark, theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        const db = await getDBConnection();
        await createTables(db);
        await initNotifications();
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
