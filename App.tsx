import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getDBConnection, createTables } from './src/database/db';
import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';

// Ignore specific warnings if necessary
LogBox.ignoreLogs(['Reanimated 2']);

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Database
        const db = await getDBConnection();
        await createTables(db);

        // Initialize Notifications
        await notifee.requestPermission();
        
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
          id: 'daily-reminder',
          name: 'Daily Practice Reminder',
        });

        // Schedule daily notification
        const date = new Date(Date.now());
        date.setHours(10, 0, 0); // Set for 10:00 AM

        if (date.getTime() < Date.now()) {
          date.setDate(date.getDate() + 1);
        }

        await notifee.createTriggerNotification(
          {
            title: 'Time to Practice!',
            body: 'Keep your streak alive! Take a quick test to improve your score.',
            android: {
              channelId,
              pressAction: {
                id: 'default',
              },
            },
          },
          {
            type: TriggerType.TIMESTAMP,
            timestamp: date.getTime(),
            repeatFrequency: RepeatFrequency.DAILY,
          },
        );
      } catch (error) {
        console.error("App initialization error:", error);
      }
    };

    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
