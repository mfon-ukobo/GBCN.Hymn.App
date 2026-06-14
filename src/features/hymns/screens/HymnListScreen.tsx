import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme, useThemedStyles } from '@/theme';

export function HymnListScreen() {
  const navigation = useNavigation();
  const { theme } = useAppTheme();
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: activeTheme.sizing.screenHorizontalPadding,
        backgroundColor: activeTheme.colors.background,
      },
      heading: {
        color: activeTheme.colors.textPrimary,
        ...activeTheme.typography.headingSmall,
      },
      actions: {
        marginTop: activeTheme.spacing.lg,
        gap: activeTheme.spacing.sm,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Hymns
      </Text>

      <View style={styles.actions}>
        <Button
          color={theme.colors.primary}
          title="Browse categories"
          onPress={() => navigation.navigate('Categories')}
        />
        <Button
          color={theme.colors.primary}
          title="Open sample hymn"
          onPress={() =>
            navigation.navigate('HymnDetail', {
              hymnId: 'navigation-test-hymn',
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}
