import { darkColors } from '../colors/darkColors';
import { radii } from '../tokens/radii';
import { sizing } from '../tokens/sizing';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';
import type { AppTheme } from '../types/theme';

export const darkTheme: AppTheme = {
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  typography,
  spacing,
  radii,
  sizing,
};
