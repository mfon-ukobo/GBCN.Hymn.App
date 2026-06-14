import { brandPalette, neutralPalette, semanticPalette } from '@/branding';

import type { ThemeColors } from '../types/theme';

export const darkColors: ThemeColors = {
  primary: brandPalette.primaryOnDark,
  primaryPressed: brandPalette.primaryOnDarkPressed,
  primaryContainer: brandPalette.darkSurface,
  accent: brandPalette.accent,
  onPrimary: brandPalette.onPrimaryDark,
  background: brandPalette.darkBackground,
  surface: brandPalette.darkSurface,
  surfaceSecondary: neutralPalette.darkSurfaceSecondary,
  surfaceElevated: neutralPalette.darkSurfaceElevated,
  textPrimary: neutralPalette.darkTextPrimary,
  textSecondary: neutralPalette.darkTextSecondary,
  textDisabled: neutralPalette.darkTextDisabled,
  textInverse: brandPalette.darkBackground,
  border: neutralPalette.darkBorder,
  divider: neutralPalette.darkDivider,
  iconPrimary: neutralPalette.darkIconPrimary,
  iconSecondary: neutralPalette.darkIconSecondary,
  success: semanticPalette.successDark,
  warning: semanticPalette.warningDark,
  error: semanticPalette.errorDark,
  overlay: semanticPalette.darkOverlay,
  statusBar: brandPalette.darkBackground,
};
