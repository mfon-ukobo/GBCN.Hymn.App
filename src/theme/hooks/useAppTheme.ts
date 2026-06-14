import { useContext } from 'react';

import { AppThemeContext } from '../state/AppThemeContext';
import type { AppThemeContextValue } from '../types/theme';

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);

  if (context === undefined) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
