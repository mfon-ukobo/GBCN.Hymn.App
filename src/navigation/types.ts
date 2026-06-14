import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  HymnsTab: undefined;
  SearchTab: undefined;
  FavouritesTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Categories: undefined;
  CategoryHymns: {
    categoryId: string;
  };
  HymnDetail: {
    hymnId: string;
  };
};

declare global {
  namespace ReactNavigation {
    // React Navigation requires an interface here so applications can augment it.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
