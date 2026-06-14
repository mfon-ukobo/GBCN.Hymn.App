import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation';
import { useThemedStyles } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HymnDetail'>;

export function HymnDetailScreen({ route }: Props) {
  const { hymnId } = route.params;
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
        marginBottom: theme.spacing.sm,
        color: theme.colors.textPrimary,
        ...theme.typography.headingSmall,
      },
      detail: {
        color: theme.colors.textSecondary,
        ...theme.typography.bodyMedium,
      },
    }),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Hymn Detail
      </Text>
      <Text style={styles.detail} testID="hymn-detail-id">
        {hymnId}
      </Text>
    </SafeAreaView>
  );
}
