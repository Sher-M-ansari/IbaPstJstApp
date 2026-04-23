export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  mode: 'light' as ThemeMode,
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#E3F2FD',
  text: '#1A1A1A',
  textSecondary: '#757575',
  textOnPrimary: '#FFFFFF',
  border: '#E0E0E0',
  shadow: '#000000',
  shadowOpacity: 0.1,
  switchThumbOff: '#F4F3F4',
  switchTrackOff: '#E0E0E0',
  primary: '#00BFFF',
  secondary: '#FF6347',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  accentPurple: '#9C27B0',
  accentSlate: '#607D8B',
  subjects: {
    english: '#4A90E2',
    math: '#F5A623',
    science: '#7ED321',
    combined: '#9013FE',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#1A2733',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textOnPrimary: '#FFFFFF',
  border: '#2A2A2A',
  shadow: '#000000',
  shadowOpacity: 0.3,
  switchThumbOff: '#616161',
  switchTrackOff: '#2A2A2A',
  primary: '#00BFFF',
  secondary: '#FF6347',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  accentPurple: '#BA68C8',
  accentSlate: '#90A4AE',
  subjects: {
    english: '#64B5F6',
    math: '#FFB74D',
    science: '#AED581',
    combined: '#B39DDB',
  },
};

export type Theme = typeof lightTheme;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
};
