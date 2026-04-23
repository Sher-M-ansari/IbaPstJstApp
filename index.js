/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

notifee.onBackgroundEvent(async () => {
  // Stub — registered before AppRegistry so notifee can wake the app
  // from a killed state to handle notification events.
});

AppRegistry.registerComponent(appName, () => App);
