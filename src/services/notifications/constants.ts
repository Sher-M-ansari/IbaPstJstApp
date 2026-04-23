export const CHANNEL_ID = 'daily-reminder';
export const CHANNEL_NAME = 'Daily Practice Reminder';
export const NOTIFICATION_ID_PREFIX = 'daily-reminder-';

export const SCHEDULE_WINDOW_DAYS = 14;
export const MESSAGE_ROTATION_LENGTH = 10;

export const DEFAULT_HOUR = 10;
export const DEFAULT_MINUTE = 0;

export const STORAGE_KEYS = {
  enabled: '@notifications/enabled',
  hour: '@notifications/hour',
  minute: '@notifications/minute',
  anchorDate: '@notifications/anchorDate',
  lastScheduledIndex: '@notifications/lastScheduledIndex',
} as const;

export const FOREGROUND_RESCHEDULE_DEBOUNCE_MS = 60_000;
