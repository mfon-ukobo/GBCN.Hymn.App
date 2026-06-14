import { getStatusBarStyle } from '../components/ThemedStatusBar';
import { darkTheme } from '../themes/darkTheme';
import { lightTheme } from '../themes/lightTheme';
import { createNavigationTheme } from './createNavigationTheme';

describe('createNavigationTheme', () => {
  it.each([lightTheme, darkTheme])('maps the $mode application theme', (theme) => {
    expect(createNavigationTheme(theme)).toEqual({
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
        regular: {
          fontFamily: theme.typography.bodyMedium.fontFamily,
          fontWeight: '400',
        },
        medium: {
          fontFamily: theme.typography.labelMedium.fontFamily,
          fontWeight: '500',
        },
        bold: {
          fontFamily: theme.typography.headingSmall.fontFamily,
          fontWeight: '600',
        },
        heavy: {
          fontFamily: theme.typography.headingLarge.fontFamily,
          fontWeight: '700',
        },
      },
    });
  });
});

describe('getStatusBarStyle', () => {
  it('uses dark content for the light theme', () => {
    expect(getStatusBarStyle(lightTheme)).toBe('dark');
  });

  it('uses light content for the dark theme', () => {
    expect(getStatusBarStyle(darkTheme)).toBe('light');
  });
});
