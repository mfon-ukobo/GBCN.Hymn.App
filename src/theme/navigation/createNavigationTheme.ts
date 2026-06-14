import type { Theme as NavigationTheme } from '@react-navigation/native';
import type { TextStyle } from 'react-native';

import type { AppTheme } from '../types/theme';

type NavigationFontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export function createNavigationTheme(theme: AppTheme): NavigationTheme {
  return {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
    fonts: {
      regular: createNavigationFont(theme.typography.bodyMedium, '400'),
      medium: createNavigationFont(theme.typography.labelMedium, '500'),
      bold: createNavigationFont(theme.typography.headingSmall, '600'),
      heavy: createNavigationFont(theme.typography.headingLarge, '700'),
    },
  };
}

function createNavigationFont(
  typography: TextStyle,
  fontWeight: NavigationFontWeight,
) {
  return {
    fontFamily: typography.fontFamily ?? 'System',
    fontWeight,
  };
}
