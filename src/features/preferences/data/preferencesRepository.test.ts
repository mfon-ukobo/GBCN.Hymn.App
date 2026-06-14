import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_USER_PREFERENCES,
  USER_PREFERENCES_STORAGE_KEY,
  type UserPreferences,
} from '../domain/userPreferences';
import { preferencesRepository } from './preferencesRepository';

const validPreferences: UserPreferences = {
  themeMode: 'dark',
  hymnTextSize: 'large',
};

describe('preferencesRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('returns defaults when no saved preferences exist', async () => {
    await expect(preferencesRepository.load()).resolves.toEqual(DEFAULT_USER_PREFERENCES);
  });

  it('loads valid stored preferences', async () => {
    await storeValue({
      schemaVersion: 1,
      preferences: validPreferences,
    });

    await expect(preferencesRepository.load()).resolves.toEqual(validPreferences);
  });

  it.each([
    ['malformed JSON', '{not-json'],
    ['an empty value', ''],
    [
      'an unsupported schema version',
      JSON.stringify({ schemaVersion: 2, preferences: validPreferences }),
    ],
  ])('returns defaults for %s', async (_caseName, storedValue) => {
    await AsyncStorage.setItem(USER_PREFERENCES_STORAGE_KEY, storedValue);

    await expect(preferencesRepository.load()).resolves.toEqual(DEFAULT_USER_PREFERENCES);
  });

  it('replaces an invalid theme mode with its default', async () => {
    await storeValue({
      schemaVersion: 1,
      preferences: { themeMode: 'automatic', hymnTextSize: 'large' },
    });

    await expect(preferencesRepository.load()).resolves.toEqual({
      themeMode: 'light',
      hymnTextSize: 'large',
    });
  });

  it('replaces an invalid hymn text size while preserving a valid theme mode', async () => {
    await storeValue({
      schemaVersion: 1,
      preferences: { themeMode: 'dark', hymnTextSize: 'very-large' },
    });

    await expect(preferencesRepository.load()).resolves.toEqual({
      themeMode: 'dark',
      hymnTextSize: 'medium',
    });
  });

  it('returns defaults when storage reads fail', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('read failed'));

    await expect(preferencesRepository.load()).resolves.toEqual(DEFAULT_USER_PREFERENCES);
  });

  it.each([
    ['theme mode', { themeMode: 'dark', hymnTextSize: 'medium' }],
    ['hymn text size', { themeMode: 'light', hymnTextSize: 'large' }],
  ] satisfies [string, UserPreferences][])('persists a valid %s update', async (_name, preferences) => {
    await expect(preferencesRepository.update(preferences)).resolves.toEqual(preferences);
    await expect(AsyncStorage.getItem(USER_PREFERENCES_STORAGE_KEY)).resolves.toBe(
      JSON.stringify({
        schemaVersion: 1,
        preferences,
      }),
    );
  });

  it('rejects invalid updates without writing them', async () => {
    const invalidPreferences = {
      themeMode: 'automatic',
      hymnTextSize: 'medium',
    } as unknown as UserPreferences;

    await expect(preferencesRepository.update(invalidPreferences)).rejects.toThrow(
      'Invalid user preferences.',
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('propagates write failures', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('write failed'));

    await expect(preferencesRepository.update(validPreferences)).rejects.toThrow('write failed');
  });

  it('removes only the preference key and returns defaults when reset', async () => {
    await storeValue({
      schemaVersion: 1,
      preferences: validPreferences,
    });
    await AsyncStorage.setItem('unrelated-key', 'keep-me');

    await expect(preferencesRepository.reset()).resolves.toEqual(DEFAULT_USER_PREFERENCES);
    await expect(AsyncStorage.getItem(USER_PREFERENCES_STORAGE_KEY)).resolves.toBeNull();
    await expect(AsyncStorage.getItem('unrelated-key')).resolves.toBe('keep-me');
  });
});

async function storeValue(value: unknown) {
  await AsyncStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(value));
}
