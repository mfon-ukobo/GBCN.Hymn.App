import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePreferences } from '@/features/preferences';
import type { RootStackParamList } from '@/navigation';
import { useThemedStyles } from '@/theme';

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
  const { preferences } = usePreferences();
  const [hymn, setHymn] = useState<Hymn | null | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
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

  useEffect(() => {
    if (hymn) {
      navigation.setOptions({ title: `Hymn ${hymn.number}` });
    }
  }, [hymn, navigation]);

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
