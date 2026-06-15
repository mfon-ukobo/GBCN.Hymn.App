import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/theme';

interface ScreenMessageProps {
  detail?: string;
  loading?: boolean;
  title: string;
}

export function ScreenMessage({ detail, loading = false, title }: ScreenMessageProps) {
  const { theme } = useAppTheme();
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: activeTheme.spacing.xl,
      },
      title: {
        color: activeTheme.colors.textPrimary,
        textAlign: 'center',
        ...activeTheme.typography.bodyLarge,
      },
      detail: {
        marginTop: activeTheme.spacing.sm,
        color: activeTheme.colors.textSecondary,
        textAlign: 'center',
        ...activeTheme.typography.bodyMedium,
      },
      loading: {
        marginBottom: activeTheme.spacing.md,
      },
    }),
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          accessibilityLabel={title}
          color={theme.colors.primary}
          style={styles.loading}
        />
      ) : null}
      <Text accessibilityRole={loading ? undefined : 'alert'} style={styles.title}>
        {title}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}
