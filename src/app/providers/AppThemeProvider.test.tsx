import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  DEFAULT_USER_PREFERENCES,
  PreferencesProvider,
  usePreferences,
  type PreferencesContextValue,
  type UserPreferences,
} from '@/features/preferences';
import {
  darkTheme,
  lightTheme,
  useAppTheme,
  useThemedStyles,
  type AppThemeContextValue,
} from '@/theme';

import { AppThemeProvider } from './AppThemeProvider';

interface ContextRefs {
  preferences: ContextRef<PreferencesContextValue>;
  theme: ContextRef<AppThemeContextValue>;
}

interface ContextRef<T> {
  current: T | null;
}

function ThemeProbe({
  onContextChange,
}: {
  onContextChange: (
    preferences: PreferencesContextValue,
    theme: AppThemeContextValue,
  ) => void;
}) {
  const preferences = usePreferences();
  const theme = useAppTheme();

  useEffect(() => {
    onContextChange(preferences, theme);
  }, [onContextChange, preferences, theme]);

  return (
    <Text testID="theme-state">
      {theme.mode}:{String(theme.isDark)}:{theme.theme.colors.background}
    </Text>
  );
}

describe('AppThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['light', lightTheme],
    ['dark', darkTheme],
  ] as const)('resolves %s preferences to the stable application theme', async (mode, expectedTheme) => {
    const repository = createRepository({
      load: jest.fn().mockResolvedValue({ ...DEFAULT_USER_PREFERENCES, themeMode: mode }),
    });
    const contextRefs = await renderThemeProvider(repository);

    await waitFor(() => {
      expect(getThemeContext(contextRefs).mode).toBe(mode);
    });

    expect(getThemeContext(contextRefs).theme).toBe(expectedTheme);
    expect(getThemeContext(contextRefs).isDark).toBe(expectedTheme.isDark);
  });

  it('updates the active theme immediately when the preference changes', async () => {
    const contextRefs = await renderThemeProvider(createRepository());

    await waitFor(() => {
      expect(screen.getByTestId('theme-state')).toHaveTextContent(
        `light:false:${lightTheme.colors.background}`,
      );
    });

    await act(async () => {
      await getPreferencesContext(contextRefs).setThemeMode('dark');
    });

    expect(screen.getByTestId('theme-state')).toHaveTextContent(
      `dark:true:${darkTheme.colors.background}`,
    );
    expect(getThemeContext(contextRefs).theme).toBe(darkTheme);
  });

  it('does not access AsyncStorage directly', async () => {
    await renderThemeProvider(createRepository());

    await waitFor(() => {
      expect(screen.getByTestId('theme-state')).toBeVisible();
    });

    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });
});

describe('theme hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when useAppTheme is used outside AppThemeProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(render(<OutsideProviderProbe />)).rejects.toThrow(
      'useAppTheme must be used within AppThemeProvider',
    );
  });

  it('regenerates themed styles after the active theme changes', async () => {
    const styleFactory = jest.fn((theme) =>
      StyleSheet.create({
        label: {
          color: theme.colors.textPrimary,
        },
      }),
    );
    const contextRefs = createContextRefs();
    const repository = createRepository();

    await render(
      <PreferencesProvider repository={repository}>
        <AppThemeProvider>
          <ThemeProbe onContextChange={captureContexts(contextRefs)} />
          <ThemedStyleProbe factory={styleFactory} />
        </AppThemeProvider>
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('themed-style')).toHaveStyle({
        color: lightTheme.colors.textPrimary,
      });
    });
    expect(styleFactory).toHaveBeenCalledTimes(1);

    await act(async () => {
      await getPreferencesContext(contextRefs).setThemeMode('dark');
    });

    expect(screen.getByTestId('themed-style')).toHaveStyle({
      color: darkTheme.colors.textPrimary,
    });
    expect(styleFactory).toHaveBeenCalledTimes(2);
  });
});

function OutsideProviderProbe() {
  useAppTheme();
  return null;
}

function ThemedStyleProbe({
  factory,
}: {
  factory: (theme: typeof lightTheme) => ReturnType<typeof StyleSheet.create>;
}) {
  const styles = useThemedStyles(factory);
  return (
    <Text style={styles.label} testID="themed-style">
      Themed
    </Text>
  );
}

async function renderThemeProvider(repository: ReturnType<typeof createRepository>) {
  const contextRefs = createContextRefs();

  await render(
    <PreferencesProvider repository={repository}>
      <AppThemeProvider>
        <ThemeProbe onContextChange={captureContexts(contextRefs)} />
      </AppThemeProvider>
    </PreferencesProvider>,
  );

  return contextRefs;
}

function createRepository(overrides: Partial<ReturnType<typeof createRepositoryBase>> = {}) {
  return {
    ...createRepositoryBase(),
    ...overrides,
  };
}

function createRepositoryBase() {
  return {
    load: jest.fn().mockResolvedValue({ ...DEFAULT_USER_PREFERENCES }),
    reset: jest.fn().mockResolvedValue({ ...DEFAULT_USER_PREFERENCES }),
    update: jest.fn((preferences: UserPreferences) => Promise.resolve(preferences)),
  };
}

function getThemeContext(contextRefs: ContextRefs) {
  if (contextRefs.theme.current === null) {
    throw new Error('Theme context has not rendered.');
  }

  return contextRefs.theme.current;
}

function getPreferencesContext(contextRefs: ContextRefs) {
  if (contextRefs.preferences.current === null) {
    throw new Error('Preferences context has not rendered.');
  }

  return contextRefs.preferences.current;
}

function createContextRefs(): ContextRefs {
  return {
    preferences: { current: null },
    theme: { current: null },
  };
}

function captureContexts(contextRefs: ContextRefs) {
  return (preferences: PreferencesContextValue, theme: AppThemeContextValue) => {
    contextRefs.preferences.current = preferences;
    contextRefs.theme.current = theme;
  };
}
