import { useNavigation } from '@react-navigation/native';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HymnListScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.heading}>
        Hymns
      </Text>

      <View style={styles.actions}>
        <Button title="Browse categories" onPress={() => navigation.navigate('Categories')} />
        <Button
          title="Open sample hymn"
          onPress={() =>
            navigation.navigate('HymnDetail', {
              hymnId: 'navigation-test-hymn',
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
    gap: 12,
  },
});
