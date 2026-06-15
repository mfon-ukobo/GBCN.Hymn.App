import { Component, type ErrorInfo, type PropsWithChildren, Suspense } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { appBranding, getBrandingLogo } from '@/branding';
import { PreferencesProvider, usePreferences } from '@/features/preferences';
import { HymnStorageProvider } from '@/infrastructure/database';
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
  const { isHydrated } = usePreferences();
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      root: {
        flex: 1,
        backgroundColor: activeTheme.colors.statusBar,
      },
    }),
  );

  return (
    <View style={styles.root}>
      <ThemedStatusBar />
      {!isHydrated ? (
        <StartupScreen />
      ) : (
        <HymnStorageErrorBoundary>
          <Suspense fallback={<StartupScreen />}>
            <HymnStorageProvider>
              <SafeAreaProvider>
                <AppNavigator />
              </SafeAreaProvider>
            </HymnStorageProvider>
          </Suspense>
        </HymnStorageErrorBoundary>
      )}
    </View>
  );
}

function StartupScreen() {
  const { theme } = useAppTheme();
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: activeTheme.spacing.lg,
        backgroundColor: activeTheme.colors.background,
      },
      startupLogo: {
        width: 144,
        height: 144,
        marginBottom: activeTheme.spacing.lg,
      },
    }),
  );

  return (
    <View style={styles.centered}>
      <Image
        accessibilityLabel={`${appBranding.appName} logo`}
        resizeMode="contain"
        source={getBrandingLogo(theme.mode)}
        style={styles.startupLogo}
      />
      <ActivityIndicator
        accessibilityLabel={`${appBranding.appName} is starting`}
        color={theme.colors.primary}
      />
    </View>
  );
}

interface HymnStorageErrorBoundaryState {
  error: Error | null;
}

class HymnStorageErrorBoundary extends Component<
  PropsWithChildren,
  HymnStorageErrorBoundaryState
> {
  state: HymnStorageErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): HymnStorageErrorBoundaryState {
    return {
      error: error instanceof Error ? error : new Error('Unknown database initialization error.'),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('Hymn database initialization failed.', error, info);
    }
  }

  render() {
    return this.state.error ? <StorageErrorScreen error={this.state.error} /> : this.props.children;
  }
}

function StorageErrorScreen({ error }: { error: Error }) {
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
      },
      heading: {
        marginBottom: theme.spacing.sm,
        color: theme.colors.error,
        textAlign: 'center',
        ...theme.typography.bodyLarge,
      },
      detail: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        ...theme.typography.bodySmall,
      },
    }),
  );

  return (
    <View style={styles.centered}>
      <Text accessibilityRole="alert" style={styles.heading}>
        Local hymn storage could not be initialized.
      </Text>
      {__DEV__ ? <Text style={styles.detail}>{error.message}</Text> : null}
    </View>
  );
}
