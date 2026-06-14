import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PreferencesProvider, usePreferences } from '@/features/preferences';
import { initializeHymnStorage } from '@/infrastructure/database';
import { AppNavigator } from '@/navigation';

export default function App() {
  return (
    <PreferencesProvider>
      <AppContent />
    </PreferencesProvider>
  );
}

function AppContent() {
  const [initializationError, setInitializationError] = useState<Error | null>(null);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const { isHydrated } = usePreferences();

  useEffect(() => {
    initializeHymnStorage()
      .then(() => setIsDatabaseReady(true))
      .catch((error: unknown) => {
        setInitializationError(
          error instanceof Error ? error : new Error('Unknown database initialization error.'),
        );
      });
  }, []);

  if (initializationError) {
    return (
      <View style={styles.centered}>
        <Text accessibilityRole="alert" style={styles.errorHeading}>
          Local hymn storage could not be initialized.
        </Text>
        {__DEV__ ? <Text>{initializationError.message}</Text> : null}
      </View>
    );
  }

  if (!isDatabaseReady || !isHydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator accessibilityLabel="Initializing application" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorHeading: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
