import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FavouritesScreen } from '@/features/favourites';
import { HymnListScreen } from '@/features/hymns';
import { SearchScreen } from '@/features/search';
import { SettingsScreen } from '@/features/settings';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="HymnsTab" screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HymnsTab"
        component={HymnListScreen}
        options={{
          title: 'Hymns',
          tabBarLabel: 'Hymns',
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen
        name="FavouritesTab"
        component={FavouritesScreen}
        options={{
          title: 'Favourites',
          tabBarLabel: 'Favourites',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
