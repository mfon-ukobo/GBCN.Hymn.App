import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Categories'>;

export function CategoriesScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Categories
      </Text>

      <View style={styles.actions}>
        <Button
          title="Open sample category"
          onPress={() =>
            navigation.navigate('CategoryHymns', {
              categoryId: 'navigation-test-category',
            })
          }
        />
      </View>
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
    fontSize: 24,
    fontWeight: '600',
  },
  actions: {
    marginTop: 24,
  },
});
