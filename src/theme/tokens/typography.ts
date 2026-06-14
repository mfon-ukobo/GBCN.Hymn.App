import { Platform, type TextStyle } from 'react-native';

import type { ThemeTypography } from '../types/theme';

const fontFamily = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: 'system-ui',
});

function createTextStyle(
  fontSize: number,
  lineHeight: number,
  fontWeight: NonNullable<TextStyle['fontWeight']>,
  letterSpacing = 0,
): TextStyle {
  return {
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
  };
}

export const typography: ThemeTypography = {
  display: createTextStyle(40, 48, '700', -0.4),
  headingLarge: createTextStyle(32, 40, '700', -0.3),
  headingMedium: createTextStyle(28, 36, '600', -0.2),
  headingSmall: createTextStyle(24, 32, '600', -0.1),
  bodyLarge: createTextStyle(18, 28, '400'),
  bodyMedium: createTextStyle(16, 24, '400'),
  bodySmall: createTextStyle(14, 20, '400'),
  labelLarge: createTextStyle(16, 24, '600', 0.1),
  labelMedium: createTextStyle(14, 20, '600', 0.1),
  caption: createTextStyle(12, 16, '400', 0.2),
};
