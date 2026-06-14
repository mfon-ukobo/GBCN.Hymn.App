import { StatusBar, type StatusBarStyle } from 'expo-status-bar';

import type { AppTheme } from '../types/theme';
import { useAppTheme } from '../hooks/useAppTheme';

export function ThemedStatusBar() {
  const { theme } = useAppTheme();

  return <StatusBar style={getStatusBarStyle(theme)} />;
}

export function getStatusBarStyle(theme: AppTheme): StatusBarStyle {
  return theme.isDark ? 'light' : 'dark';
}
