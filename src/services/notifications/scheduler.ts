import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  TriggerType,
} from '@notifee/react-native';
import { AppState, type AppStateStatus } from 'react-native';
import { getDBConnection } from '../../database/db';
import {
  CHANNEL_ID,
  CHANNEL_NAME,
  FOREGROUND_RESCHEDULE_DEBOUNCE_MS,
  MESSAGE_ROTATION_LENGTH,
  NOTIFICATION_ID_PREFIX,
  SCHEDULE_WINDOW_DAYS,
} from './constants';
import { renderMessage } from './messages';
import { getReminderStats } from './stats';
import {
  getOrCreateAnchor,
  getReminderTime,
  isEnabled,
  setEnabledFlag,
  setLastScheduledIndex,
  setReminderTime as setReminderTimeInStorage,
} from './storage';

const toYMDCompact = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};

const daysBetween = (a: Date, b: Date): number => {
  const MS_PER_DAY = 86_400_000;
  const aMid = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bMid = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bMid - aMid) / MS_PER_DAY);
};

const computeTriggerDate = (hour: number, minute: number, dayOffset: number): Date => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  return d;
};

export const hasNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
};

const ensureChannel = async (): Promise<void> => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.DEFAULT,
  });
};

export const cancelAllReminders = async (): Promise<void> => {
  const ids = await notifee.getTriggerNotificationIds();
  const mine = ids.filter((id) => id.startsWith(NOTIFICATION_ID_PREFIX));
  if (mine.length > 0) {
    await notifee.cancelTriggerNotifications(mine);
  }
};

export const rescheduleAll = async (): Promise<void> => {
  const enabled = await isEnabled();
  if (!enabled) {
    await cancelAllReminders();
    return;
  }

  const permitted = await hasNotificationPermission();
  if (!permitted) {
    await setEnabledFlag(false);
    await cancelAllReminders();
    return;
  }

  await ensureChannel();
  await cancelAllReminders();

  const { hour, minute } = await getReminderTime();
  const anchor = await getOrCreateAnchor();

  const db = await getDBConnection();
  const stats = await getReminderStats(db);

  let lastIndex = 0;
  for (let offset = 1; offset <= SCHEDULE_WINDOW_DAYS; offset++) {
    const target = computeTriggerDate(hour, minute, offset);
    const rawIndex = daysBetween(anchor, target) % MESSAGE_ROTATION_LENGTH;
    const index = ((rawIndex % MESSAGE_ROTATION_LENGTH) + MESSAGE_ROTATION_LENGTH) % MESSAGE_ROTATION_LENGTH;
    const { title, body } = renderMessage(index, stats);

    await notifee.createTriggerNotification(
      {
        id: `${NOTIFICATION_ID_PREFIX}${toYMDCompact(target)}`,
        title,
        body,
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: target.getTime(),
      },
    );
    lastIndex = index;
  }

  await setLastScheduledIndex(lastIndex);
};

let foregroundListenerRegistered = false;
let appStateSubscription: { remove: () => void } | null = null;
let lastReschedAt = 0;

const onForegroundEvent = async ({ type }: { type: EventType }) => {
  if (type === EventType.PRESS) {
    // stub — future: deep-link to TestSetup
  }
};

const onAppStateChange = (state: AppStateStatus) => {
  if (state !== 'active') return;
  const now = Date.now();
  if (now - lastReschedAt < FOREGROUND_RESCHEDULE_DEBOUNCE_MS) return;
  lastReschedAt = now;
  rescheduleAll().catch((err) => console.warn('[notifications] foreground reschedule failed', err));
};

export const initNotifications = async (): Promise<void> => {
  try {
    await ensureChannel();

    const granted = await requestNotificationPermission();
    if (!granted) {
      await setEnabledFlag(false);
      await cancelAllReminders();
      return;
    }

    if (!foregroundListenerRegistered) {
      notifee.onForegroundEvent(onForegroundEvent);
      foregroundListenerRegistered = true;
    }

    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', onAppStateChange);
    }

    lastReschedAt = Date.now();
    await rescheduleAll();
  } catch (err) {
    console.warn('[notifications] init failed', err);
  }
};

export const setNotificationsEnabledAndApply = async (next: boolean): Promise<boolean> => {
  if (!next) {
    await setEnabledFlag(false);
    await cancelAllReminders();
    return false;
  }

  let granted = await hasNotificationPermission();
  if (!granted) {
    granted = await requestNotificationPermission();
  }
  if (!granted) {
    await setEnabledFlag(false);
    await cancelAllReminders();
    return false;
  }

  await setEnabledFlag(true);
  await rescheduleAll();
  return true;
};

export const setReminderTimeAndApply = async (hour: number, minute: number): Promise<void> => {
  await setReminderTimeInStorage(hour, minute);
  if (await isEnabled()) {
    await rescheduleAll();
  }
};
