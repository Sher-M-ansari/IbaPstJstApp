import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_HOUR,
  DEFAULT_MINUTE,
  STORAGE_KEYS,
} from './constants';

const toLocalYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const isEnabled = async (): Promise<boolean> => {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.enabled);
  if (v === null) return true;
  return v === 'true';
};

export const setEnabledFlag = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.enabled, enabled ? 'true' : 'false');
};

export const getReminderTime = async (): Promise<{ hour: number; minute: number }> => {
  const [h, m] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.hour),
    AsyncStorage.getItem(STORAGE_KEYS.minute),
  ]);
  const hour = h === null ? DEFAULT_HOUR : clampInt(parseInt(h, 10), 0, 23, DEFAULT_HOUR);
  const minute = m === null ? DEFAULT_MINUTE : clampInt(parseInt(m, 10), 0, 59, DEFAULT_MINUTE);
  return { hour, minute };
};

export const setReminderTime = async (hour: number, minute: number): Promise<void> => {
  const h = clampInt(Math.floor(hour), 0, 23, DEFAULT_HOUR);
  const m = clampInt(Math.floor(minute), 0, 59, DEFAULT_MINUTE);
  await AsyncStorage.setItem(STORAGE_KEYS.hour, String(h));
  await AsyncStorage.setItem(STORAGE_KEYS.minute, String(m));
};

export const getOrCreateAnchor = async (): Promise<Date> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.anchorDate);
  if (stored && /^\d{4}-\d{2}-\d{2}$/.test(stored)) {
    const [y, mo, d] = stored.split('-').map(Number);
    return new Date(y, mo - 1, d);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await AsyncStorage.setItem(STORAGE_KEYS.anchorDate, toLocalYMD(today));
  return today;
};

export const setLastScheduledIndex = async (index: number): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.lastScheduledIndex, String(index));
};

const clampInt = (v: number, lo: number, hi: number, fallback: number): number => {
  if (!Number.isFinite(v)) return fallback;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
};
