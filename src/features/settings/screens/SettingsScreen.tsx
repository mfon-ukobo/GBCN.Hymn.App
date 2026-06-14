import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appBranding } from '@/branding';
import { useThemedStyles } from '@/theme';

export function SettingsScreen() {
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.sizing.screenHorizontalPadding,
        backgroundColor: theme.colors.background,
      },
      heading: {
        color: theme.colors.textPrimary,
        ...theme.typography.headingSmall,
      },
      appName: {
        marginTop: theme.spacing.sm,
        color: theme.colors.textSecondary,
        ...theme.typography.bodyMedium,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Settings
      </Text>
      <Text style={styles.appName}>{appBranding.appName}</Text>
    </SafeAreaView>
  );
}
