import { type PropsWithChildren, useMemo } from 'react';

import { usePreferences } from '@/features/preferences';
import { AppThemeContext, darkTheme, lightTheme } from '@/theme';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const {
    preferences: { themeMode },
  } = usePreferences();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const contextValue = useMemo(
    () => ({
      theme,
      mode: theme.mode,
      isDark: theme.isDark,
    }),
    [theme],
  );

  return <AppThemeContext.Provider value={contextValue}>{children}</AppThemeContext.Provider>;
}
