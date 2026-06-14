import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PreferencesProvider, usePreferences } from '@/features/preferences';
import { initializeHymnStorage } from '@/infrastructure/database';
import { AppNavigator } from '@/navigation';
import { ThemedStatusBar, useAppTheme, useThemedStyles } from '@/theme';

import { AppThemeProvider } from './providers/AppThemeProvider';

export default function App() {
  return (
    <PreferencesProvider>
      <AppThemeProvider>
        <AppContent />
      </AppThemeProvider>
    </PreferencesProvider>
  );
}

function AppContent() {
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const { isHydrated } = usePreferences();
  const { theme } = useAppTheme();
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: activeTheme.colors.statusBar,
      },
      centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: activeTheme.spacing.lg,
        backgroundColor: activeTheme.colors.background,
      },
      errorHeading: {
        marginBottom: activeTheme.spacing.sm,
        color: activeTheme.colors.error,
        textAlign: 'center',
        ...activeTheme.typography.bodyLarge,
      },
      errorDetail: {
        color: activeTheme.colors.textSecondary,
        ...activeTheme.typography.bodySmall,
      },
    }),
  );

  useEffect(() => {
    initializeHymnStorage()
      .then(() => setIsDatabaseReady(true))
      .catch((error: unknown) => {
        setInitializationError(
          error instanceof Error ? error : new Error('Unknown database initialization error.'),
        );
      });
  }, []);

  return (
    <View style={styles.root}>
      <ThemedStatusBar />
      {initializationError ? (
        <View style={styles.centered}>
          <Text accessibilityRole="alert" style={styles.errorHeading}>
            Local hymn storage could not be initialized.
          </Text>
          {__DEV__ ? <Text style={styles.errorDetail}>{initializationError.message}</Text> : null}
        </View>
      ) : !isDatabaseReady || !isHydrated ? (
        <View style={styles.centered}>
          <ActivityIndicator
            accessibilityLabel="Initializing application"
            color={theme.colors.primary}
          />
        </View>
      ) : (
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      )}
    </View>
  );
}
