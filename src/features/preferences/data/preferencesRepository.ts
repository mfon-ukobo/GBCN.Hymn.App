import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_USER_PREFERENCES,
  isUserPreferences,
  resolveStoredUserPreferences,
  type StoredUserPreferences,
  USER_PREFERENCES_SCHEMA_VERSION,
  USER_PREFERENCES_STORAGE_KEY,
  type UserPreferences,
} from '../domain/userPreferences';

export interface PreferencesRepository {
  load(): Promise<UserPreferences>;
  update(preferences: UserPreferences): Promise<UserPreferences>;
  reset(): Promise<UserPreferences>;
}

export const preferencesRepository: PreferencesRepository = {
  async load() {
    try {
      const storedValue = await AsyncStorage.getItem(USER_PREFERENCES_STORAGE_KEY);

      if (storedValue === null) {
        return { ...DEFAULT_USER_PREFERENCES };
      }

      try {
        return resolveStoredUserPreferences(JSON.parse(storedValue));
      } catch {
        return { ...DEFAULT_USER_PREFERENCES };
      }
    } catch (error: unknown) {
      logStorageFailure('load', error);
      return { ...DEFAULT_USER_PREFERENCES };
    }
  },

  async update(preferences) {
    if (!isUserPreferences(preferences)) {
      throw new Error('Invalid user preferences.');
    }

    const storedPreferences: StoredUserPreferences = {
      schemaVersion: USER_PREFERENCES_SCHEMA_VERSION,
      preferences: { ...preferences },
    };

    try {
      await AsyncStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(storedPreferences));
      return { ...preferences };
    } catch (error: unknown) {
      logStorageFailure('update', error);
      throw error;
    }
  },

  async reset() {
    try {
      await AsyncStorage.removeItem(USER_PREFERENCES_STORAGE_KEY);
      return { ...DEFAULT_USER_PREFERENCES };
    } catch (error: unknown) {
      logStorageFailure('reset', error);
      throw error;
    }
  },
};

function logStorageFailure(operation: 'load' | 'reset' | 'update', error: unknown) {
  if (__DEV__) {
    console.error(`Preference storage ${operation} failed.`, error);
  }
}
