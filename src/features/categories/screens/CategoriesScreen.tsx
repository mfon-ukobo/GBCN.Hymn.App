import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation';
import { useAppTheme, useThemedStyles } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export function CategoriesScreen({ navigation }: Props) {
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
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Categories
      </Text>

      <View style={styles.actions}>
        <Button
          color={theme.colors.primary}
          title="Open sample category"
          onPress={() =>
            navigation.navigate('CategoryHymns', {
              categoryId: 'navigation-test-category',
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}
