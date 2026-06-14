import { useMemo } from 'react';

import type { AppTheme } from '../types/theme';
import { useAppTheme } from './useAppTheme';

export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const { theme } = useAppTheme();

  return useMemo(
    () => factory(theme),
    // Factories are intentionally theme-only so generated styles remain stable until the theme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );
}
