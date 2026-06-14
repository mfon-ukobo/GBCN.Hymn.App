import { lightColors } from '../colors/lightColors';
import { radii } from '../tokens/radii';
import { sizing } from '../tokens/sizing';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import type { AppTheme } from '../types/theme';

export const lightTheme: AppTheme = {
  mode: 'light',
  isDark: false,
  colors: lightColors,
  typography,
  spacing,
  radii,
  sizing,
};
