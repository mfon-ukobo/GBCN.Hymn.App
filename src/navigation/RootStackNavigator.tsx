import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CategoriesScreen, CategoryHymnsScreen } from '@/features/categories';
import { HymnDetailScreen } from '@/features/hymns';

import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categories',
        }}
      />
      <Stack.Screen
        name="CategoryHymns"
        component={CategoryHymnsScreen}
        options={{
          title: 'Category Hymns',
        }}
      />
      <Stack.Screen
        name="HymnDetail"
        component={HymnDetailScreen}
        options={{
          title: 'Hymn',
        }}
      />
    </Stack.Navigator>
  );
}
