import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HymnSummaryList,
  ScreenMessage,
  type HymnSummary,
  useHymnRepository,
} from '@/features/hymns';
import { useAppTheme, useThemedStyles } from '@/theme';

export function SearchScreen() {
  const navigation = useNavigation();
  const repository = useHymnRepository();
  const { theme } = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HymnSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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
        marginBottom: theme.spacing.md,
        color: theme.colors.textPrimary,
        ...theme.typography.headingSmall,
      },
      input: {
        minHeight: theme.sizing.controlHeight,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.medium,
        color: theme.colors.textPrimary,
        backgroundColor: theme.colors.surface,
        ...theme.typography.bodyMedium,
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
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      repository
        .searchHymns(trimmedQuery)
        .then((matches) => {
          if (active) {
            setResults(matches);
            setHasSearched(true);
            setError(null);
          }
        })
        .catch((reason: unknown) => {
          if (active) {
            setError(reason instanceof Error ? reason : new Error('Unable to search hymns.'));
            setHasSearched(true);
          }
        })
        .finally(() => {
          if (active) {
            setIsSearching(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, repository]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setError(null);
    if (value.trim().length === 0) {
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
    } else {
      setIsSearching(true);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.heading}>
          Search
        </Text>
        <TextInput
          accessibilityLabel="Search hymns"
          autoCorrect={false}
          onChangeText={handleQueryChange}
          placeholder="Number, title, or lyric"
          placeholderTextColor={theme.colors.textDisabled}
          returnKeyType="search"
          style={styles.input}
          value={query}
        />
      </View>
      {hasSearched && !isSearching && !error ? (
        <Text style={styles.count}>
          {results.length} {results.length === 1 ? 'hymn' : 'hymns'} found
        </Text>
      ) : null}
      <View style={styles.content}>
        {error ? (
          <ScreenMessage
            detail={__DEV__ ? error.message : undefined}
            title="Unable to search hymns."
          />
        ) : isSearching ? (
          <ScreenMessage loading title="Searching hymns" />
        ) : !hasSearched ? (
          <ScreenMessage
            detail="Search works without an internet connection."
            title="Enter a hymn number, title, or lyric."
          />
        ) : results.length === 0 ? (
          <ScreenMessage title="No hymns match your search." />
        ) : (
          <HymnSummaryList
            hymns={results}
            onPressHymn={(hymn) => navigation.navigate('HymnDetail', { hymnId: hymn.id })}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
