import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HymnSummaryList,
  ScreenMessage,
  type HymnSummary,
  useHymnRepository,
} from '@/features/hymns';
import { useThemedStyles } from '@/theme';

import { useFavourites } from '../hooks/useFavourites';

export function FavouritesScreen() {
  const navigation = useNavigation();
  const repository = useHymnRepository();
  const { favouriteHymnIds, isHydrated } = useFavourites();
  const [hymns, setHymns] = useState<HymnSummary[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const favouriteIdSet = useMemo(() => new Set(favouriteHymnIds), [favouriteHymnIds]);
  const favouriteHymns = useMemo(
    () => hymns?.filter((hymn) => favouriteIdSet.has(hymn.id)) ?? [],
    [favouriteIdSet, hymns],
  );
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      header: {
        paddingHorizontal: theme.sizing.screenHorizontalPadding,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
      },
      heading: {
        color: theme.colors.textPrimary,
        ...theme.typography.headingSmall,
      },
      count: {
        paddingHorizontal: theme.sizing.screenHorizontalPadding,
        paddingBottom: theme.spacing.sm,
        color: theme.colors.textSecondary,
        ...theme.typography.bodySmall,
      },
      content: {
        flex: 1,
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
          setError(reason instanceof Error ? reason : new Error('Unable to load favourites.'));
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
          Favourites
        </Text>
      </View>
      {isHydrated && hymns && favouriteHymns.length > 0 ? (
        <Text style={styles.count}>
          {favouriteHymns.length} favourite {favouriteHymns.length === 1 ? 'hymn' : 'hymns'}
        </Text>
      ) : null}
      <View style={styles.content}>
        {error ? (
          <ScreenMessage
            detail={__DEV__ ? error.message : undefined}
            title="Unable to load favourites."
          />
        ) : !isHydrated || hymns === null ? (
          <ScreenMessage loading title="Loading favourites" />
        ) : favouriteHymns.length === 0 ? (
          <ScreenMessage
            detail="Open a hymn and tap the heart to save it here."
            title="You have no favourite hymns yet."
          />
        ) : (
          <HymnSummaryList
            hymns={favouriteHymns}
            onPressHymn={(hymn) => navigation.navigate('HymnDetail', { hymnId: hymn.id })}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
