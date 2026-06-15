import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenMessage, type HymnCategory, useHymnRepository } from '@/features/hymns';
import type { RootStackParamList } from '@/navigation';
import { useThemedStyles } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export function CategoriesScreen({ navigation }: Props) {
  const repository = useHymnRepository();
  const [categories, setCategories] = useState<HymnCategory[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: activeTheme.colors.background,
      },
      content: {
        padding: activeTheme.sizing.screenHorizontalPadding,
      },
      item: {
        minHeight: activeTheme.sizing.touchTargetMinimum,
        justifyContent: 'center',
        paddingVertical: activeTheme.spacing.md,
      },
      name: {
        color: activeTheme.colors.textPrimary,
        ...activeTheme.typography.bodyLarge,
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: activeTheme.colors.divider,
      },
    }),
  );

  useEffect(() => {
    let active = true;
    repository
      .getCategories()
      .then((result) => {
        if (active) {
          setCategories(result);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason : new Error('Unable to load categories.'));
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <ScreenMessage
          detail={__DEV__ ? error.message : undefined}
          title="Unable to load categories."
        />
      ) : categories === null ? (
        <ScreenMessage loading title="Loading categories" />
      ) : categories.length === 0 ? (
        <ScreenMessage
          detail="The current offline hymn package does not include approved category mappings."
          title="No categories are available yet."
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={categories}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          keyExtractor={(category) => category.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('CategoryHymns', { categoryId: item.id })}
              style={styles.item}
            >
              <Text style={styles.name}>{item.name}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
