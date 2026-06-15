import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/theme';

import type { HymnSummary } from '../models/Hymn';

interface HymnSummaryListProps {
  hymns: HymnSummary[];
  onPressHymn(hymn: HymnSummary): void;
}

export function HymnSummaryList({ hymns, onPressHymn }: HymnSummaryListProps) {
  const styles = useThemedStyles((theme) =>
    StyleSheet.create({
      list: {
        flex: 1,
      },
      content: {
        paddingHorizontal: theme.sizing.screenHorizontalPadding,
        paddingBottom: theme.spacing.xl,
      },
      item: {
        minHeight: theme.sizing.touchTargetMinimum,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.md,
      },
      number: {
        width: 48,
        color: theme.colors.primary,
        textAlign: 'right',
        ...theme.typography.labelLarge,
      },
      title: {
        flex: 1,
        color: theme.colors.textPrimary,
        ...theme.typography.bodyLarge,
      },
      divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 64,
        backgroundColor: theme.colors.divider,
      },
    }),
  );

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={hymns}
      initialNumToRender={20}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      keyExtractor={(hymn) => hymn.id}
      renderItem={({ item }) => (
        <Pressable
          accessibilityLabel={`Hymn ${item.number}, ${item.title}`}
          accessibilityRole="button"
          onPress={() => onPressHymn(item)}
          style={styles.item}
        >
          <Text style={styles.number}>{item.number}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </Pressable>
      )}
      style={styles.list}
      windowSize={7}
    />
  );
}
