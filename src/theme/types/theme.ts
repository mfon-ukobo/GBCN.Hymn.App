import type { TextStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryPressed: string;
  primaryContainer: string;
  accent: string;
  onPrimary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;
  border: string;
  divider: string;
  iconPrimary: string;
  iconSecondary: string;
  success: string;
  warning: string;
  error: string;
  overlay: string;
  statusBar: string;
}

export interface ThemeTypography {
  display: TextStyle;
  headingLarge: TextStyle;
  headingMedium: TextStyle;
  headingSmall: TextStyle;
  bodyLarge: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  labelLarge: TextStyle;
  labelMedium: TextStyle;
  caption: TextStyle;
}

export interface ThemeSpacing {
  none: number;
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadii {
  none: number;
  small: number;
  medium: number;
  large: number;
  full: number;
}

export interface ThemeSizing {
  iconSmall: number;
  iconMedium: number;
  iconLarge: number;
  controlHeight: number;
  touchTargetMinimum: number;
  screenHorizontalPadding: number;
}

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  sizing: ThemeSizing;
}

export interface AppThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
}
