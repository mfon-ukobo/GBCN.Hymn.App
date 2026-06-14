import { NavigationContainer } from '@react-navigation/native';
import { useMemo } from 'react';

import { createNavigationTheme, useAppTheme } from '@/theme';
import { RootStackNavigator } from './RootStackNavigator';

export function AppNavigator() {
  const { theme } = useAppTheme();
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
