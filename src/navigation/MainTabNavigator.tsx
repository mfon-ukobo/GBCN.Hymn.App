import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FavouritesScreen } from '@/features/favourites';
import { HymnListScreen } from '@/features/hymns';
import { SearchScreen } from '@/features/search';
import { SettingsScreen } from '@/features/settings';

import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<
  keyof MainTabParamList,
  { focused: IoniconsIconName; unfocused: IoniconsIconName }
> = {
  HymnsTab: { focused: 'book', unfocused: 'book-outline' },
  SearchTab: { focused: 'search', unfocused: 'search-outline' },
  FavouritesTab: { focused: 'heart', unfocused: 'heart-outline' },
  SettingsTab: { focused: 'settings', unfocused: 'settings-outline' },
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HymnsTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            accessibilityElementsHidden
            color={color}
            importantForAccessibility="no-hide-descendants"
            name={tabIcons[route.name][focused ? 'focused' : 'unfocused']}
            size={size}
            testID={`tab-icon-${route.name}`}
          />
        ),
      })}
    >
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
