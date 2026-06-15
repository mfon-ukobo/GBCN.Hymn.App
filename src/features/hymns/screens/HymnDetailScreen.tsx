import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFavourites } from '@/features/favourites';
import { usePreferences } from '@/features/preferences';
import type { RootStackParamList } from '@/navigation';
import { useAppTheme, useThemedStyles } from '@/theme';

import { ScreenMessage } from '../components/ScreenMessage';
import type { Hymn } from '../models/Hymn';
import { useHymnRepository } from '../state/HymnRepositoryProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'HymnDetail'>;

const textSizes = {
  small: { fontSize: 16, lineHeight: 24 },
  medium: { fontSize: 18, lineHeight: 28 },
  large: { fontSize: 22, lineHeight: 34 },
} as const;

export function HymnDetailScreen({ navigation, route }: Props) {
  const { hymnId } = route.params;
  const repository = useHymnRepository();
  const { theme } = useAppTheme();
  const {
    isFavourite,
    isHydrated: areFavouritesHydrated,
    toggleFavourite,
  } = useFavourites();
  const { preferences } = usePreferences();
  const [hymn, setHymn] = useState<Hymn | null | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [favouriteError, setFavouriteError] = useState<Error | null>(null);
  const [isUpdatingFavourite, setIsUpdatingFavourite] = useState(false);
  const hymnIsFavourite = isFavourite(hymnId);
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      content: {
        padding: theme.sizing.screenHorizontalPadding,
        paddingBottom: theme.spacing.xxl,
      },
      number: {
        color: theme.colors.primary,
        ...theme.typography.labelLarge,
      },
      heading: {
        marginBottom: theme.spacing.sm,
        color: theme.colors.textPrimary,
        ...theme.typography.headingMedium,
      },
      favouriteButton: {
        width: theme.sizing.touchTargetMinimum,
        height: theme.sizing.touchTargetMinimum,
        alignItems: 'center',
        justifyContent: 'center',
      },
      favouriteButtonPressed: {
        opacity: 0.6,
      },
      favouriteError: {
        marginBottom: theme.spacing.sm,
        color: theme.colors.error,
        ...theme.typography.bodySmall,
      },
      section: {
        marginTop: theme.spacing.lg,
      },
      sectionLabel: {
        marginBottom: theme.spacing.sm,
        color: theme.colors.textSecondary,
        ...theme.typography.labelMedium,
      },
      line: {
        marginBottom: theme.spacing.xs,
        color: theme.colors.textPrimary,
      },
    }),
  );

  useEffect(() => {
    let active = true;
    repository
      .getHymnById(hymnId)
      .then((result) => {
        if (active) {
          setHymn(result);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason : new Error('Unable to load hymn.'));
        }
      });
    return () => {
      active = false;
    };
  }, [hymnId, repository]);

  const handleToggleFavourite = useCallback(async () => {
    setIsUpdatingFavourite(true);
    setFavouriteError(null);

    try {
      await toggleFavourite(hymnId);
    } catch (reason: unknown) {
      setFavouriteError(
        reason instanceof Error ? reason : new Error('Unable to update favourites.'),
      );
    } finally {
      setIsUpdatingFavourite(false);
    }
  }, [hymnId, toggleFavourite]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: hymn ? `Hymn ${hymn.number}` : 'Hymn',
      headerRight: hymn
        ? () => (
            <Pressable
              accessibilityLabel={
                hymnIsFavourite
                  ? `Remove Hymn ${hymn.number} from favourites`
                  : `Add Hymn ${hymn.number} to favourites`
              }
              accessibilityRole="button"
              accessibilityState={{
                disabled: !areFavouritesHydrated || isUpdatingFavourite,
              }}
              disabled={!areFavouritesHydrated || isUpdatingFavourite}
              hitSlop={8}
              onPress={() => void handleToggleFavourite()}
              style={({ pressed }) => [
                styles.favouriteButton,
                pressed && styles.favouriteButtonPressed,
              ]}
            >
              <Ionicons
                color={hymnIsFavourite ? theme.colors.primary : theme.colors.iconSecondary}
                name={hymnIsFavourite ? 'heart' : 'heart-outline'}
                size={theme.sizing.iconMedium}
              />
            </Pressable>
          )
        : undefined,
    });
  }, [
    areFavouritesHydrated,
    handleToggleFavourite,
    hymn,
    hymnIsFavourite,
    isUpdatingFavourite,
    navigation,
    styles.favouriteButton,
    styles.favouriteButtonPressed,
    theme.colors.iconSecondary,
    theme.colors.primary,
    theme.sizing.iconMedium,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <ScreenMessage detail={__DEV__ ? error.message : undefined} title="Unable to load hymn." />
      ) : hymn === undefined ? (
        <ScreenMessage loading title="Loading hymn" />
      ) : hymn === null ? (
        <ScreenMessage title="Hymn not found." />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.number}>Hymn {hymn.number}</Text>
          <Text accessibilityRole="header" style={styles.heading}>
            {hymn.title}
          </Text>
          {favouriteError ? (
            <Text accessibilityRole="alert" style={styles.favouriteError}>
              Unable to update favourites. Please try again.
            </Text>
          ) : null}
          {hymn.sections.map((section) => (
            <View key={section.order} style={styles.section}>
              <Text style={styles.sectionLabel}>{section.label ?? section.type}</Text>
              {section.lines.map((line, index) => (
                <Text
                  key={`${section.order}-${index}`}
                  style={[styles.line, textSizes[preferences.hymnTextSize]]}
                >
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
