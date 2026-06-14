import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemedStyles } from '@/theme';

export function FavouritesScreen() {
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
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Favourites
      </Text>
    </SafeAreaView>
  );
}
