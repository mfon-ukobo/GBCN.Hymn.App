import { brandPalette, neutralPalette, semanticPalette } from '@/branding';

import type { ThemeColors } from '../types/theme';

export const lightColors: ThemeColors = {
  primary: brandPalette.primary,
  primaryPressed: brandPalette.primaryPressed,
  primaryContainer: brandPalette.primaryContainer,
  accent: brandPalette.accent,
  onPrimary: brandPalette.onPrimary,
  background: brandPalette.lightBackground,
  surface: neutralPalette.lightSurface,
  surfaceSecondary: neutralPalette.lightSurfaceSecondary,
  surfaceElevated: neutralPalette.lightSurface,
  textPrimary: neutralPalette.lightTextPrimary,
  textSecondary: neutralPalette.lightTextSecondary,
  textDisabled: neutralPalette.lightTextDisabled,
  textInverse: brandPalette.onPrimary,
  border: neutralPalette.lightBorder,
  divider: neutralPalette.lightDivider,
  iconPrimary: neutralPalette.lightIconPrimary,
  iconSecondary: neutralPalette.lightIconSecondary,
  success: semanticPalette.successLight,
  warning: semanticPalette.warningLight,
  error: semanticPalette.errorLight,
  overlay: semanticPalette.lightOverlay,
  statusBar: brandPalette.lightBackground,
};
