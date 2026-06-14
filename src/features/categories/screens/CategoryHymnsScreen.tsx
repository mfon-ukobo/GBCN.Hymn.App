import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryHymns'>;

export function CategoryHymnsScreen({ route }: Props) {
  const { categoryId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Category Hymns
      </Text>
      <Text testID="category-hymns-id">{categoryId}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginBottom: 12,
    fontSize: 24,
    fontWeight: '600',
  },
});
