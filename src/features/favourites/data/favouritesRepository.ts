import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FAVOURITES_SCHEMA_VERSION,
  FAVOURITES_STORAGE_KEY,
  isFavouriteHymnIds,
  resolveStoredFavourites,
  type StoredFavourites,
} from '../domain/favourites';

export interface FavouritesRepository {
  load(): Promise<string[]>;
  update(hymnIds: string[]): Promise<string[]>;
}

export const favouritesRepository: FavouritesRepository = {
  async load() {
    try {
      const storedValue = await AsyncStorage.getItem(FAVOURITES_STORAGE_KEY);

      if (storedValue === null) {
        return [];
      }

      try {
        return resolveStoredFavourites(JSON.parse(storedValue));
      } catch {
        return [];
      }
    } catch (error: unknown) {
      logStorageFailure('load', error);
      return [];
    }
  },

  async update(hymnIds) {
    if (!isFavouriteHymnIds(hymnIds)) {
      throw new Error('Invalid favourite hymn IDs.');
    }

    const storedFavourites: StoredFavourites = {
      schemaVersion: FAVOURITES_SCHEMA_VERSION,
      hymnIds: [...hymnIds],
    };

    try {
      await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(storedFavourites));
      return [...hymnIds];
    } catch (error: unknown) {
      logStorageFailure('update', error);
      throw error;
    }
  },
};

function logStorageFailure(operation: 'load' | 'update', error: unknown) {
  if (__DEV__) {
    console.error(`Favourite storage ${operation} failed.`, error);
  }
}
