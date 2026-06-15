import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemedStyles } from '@/theme';

import { HymnSummaryList } from '../components/HymnSummaryList';
import { ScreenMessage } from '../components/ScreenMessage';
import type { HymnSummary } from '../models/Hymn';
import { useHymnRepository } from '../state/HymnRepositoryProvider';

export function HymnListScreen() {
  const navigation = useNavigation();
  const repository = useHymnRepository();
  const [hymns, setHymns] = useState<HymnSummary[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const styles = useThemedStyles((activeTheme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: activeTheme.colors.background,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: activeTheme.sizing.screenHorizontalPadding,
        paddingTop: activeTheme.spacing.md,
        paddingBottom: activeTheme.spacing.sm,
      },
      heading: {
        color: activeTheme.colors.textPrimary,
        ...activeTheme.typography.headingSmall,
      },
      categories: {
        minHeight: activeTheme.sizing.touchTargetMinimum,
        justifyContent: 'center',
        paddingHorizontal: activeTheme.spacing.sm,
      },
      categoriesText: {
        color: activeTheme.colors.primary,
        ...activeTheme.typography.labelMedium,
      },
      count: {
        paddingHorizontal: activeTheme.sizing.screenHorizontalPadding,
        paddingBottom: activeTheme.spacing.sm,
        color: activeTheme.colors.textSecondary,
        ...activeTheme.typography.bodySmall,
      },
    }),
  );

  useEffect(() => {
    let active = true;
    repository
      .getAllHymns()
      .then((result) => {
        if (active) {
          setHymns(result);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason : new Error('Unable to load hymns.'));
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.heading}>
          Hymns
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Categories')}
          style={styles.categories}
        >
          <Text style={styles.categoriesText}>Categories</Text>
        </Pressable>
      </View>
      {hymns ? <Text style={styles.count}>{hymns.length} hymns available offline</Text> : null}
      {error ? (
        <ScreenMessage detail={__DEV__ ? error.message : undefined} title="Unable to load hymns." />
      ) : hymns === null ? (
        <ScreenMessage loading title="Loading hymns" />
      ) : hymns.length === 0 ? (
        <ScreenMessage title="No hymns are available." />
      ) : (
        <HymnSummaryList
          hymns={hymns}
          onPressHymn={(hymn) => navigation.navigate('HymnDetail', { hymnId: hymn.id })}
        />
      )}
    </SafeAreaView>
  );
}
