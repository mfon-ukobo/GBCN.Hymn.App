import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HymnSummaryList,
  ScreenMessage,
  type HymnSummary,
  useHymnRepository,
} from '@/features/hymns';
import type { RootStackParamList } from '@/navigation';
import { useThemedStyles } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryHymns'>;

export function CategoryHymnsScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const repository = useHymnRepository();
  const [hymns, setHymns] = useState<HymnSummary[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
    }),
  );

  useEffect(() => {
    let active = true;
    repository
      .getHymnsByCategory(categoryId)
      .then((result) => {
        if (active) {
          setHymns(result);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason : new Error('Unable to load category hymns.'));
        }
      });
    return () => {
      active = false;
    };
  }, [categoryId, repository]);

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <ScreenMessage
          detail={__DEV__ ? error.message : undefined}
          title="Unable to load category hymns."
        />
      ) : hymns === null ? (
        <ScreenMessage loading title="Loading category hymns" />
      ) : hymns.length === 0 ? (
        <ScreenMessage title="No hymns are assigned to this category." />
      ) : (
        <HymnSummaryList
          hymns={hymns}
          onPressHymn={(hymn) => navigation.navigate('HymnDetail', { hymnId: hymn.id })}
        />
      )}
    </SafeAreaView>
  );
}
