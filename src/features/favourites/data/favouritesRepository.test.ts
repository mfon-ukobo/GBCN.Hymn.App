import AsyncStorage from '@react-native-async-storage/async-storage';

import { FAVOURITES_STORAGE_KEY } from '../domain/favourites';
import { favouritesRepository } from './favouritesRepository';

describe('favouritesRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('returns an empty list when no favourites exist', async () => {
    await expect(favouritesRepository.load()).resolves.toEqual([]);
  });

  it('loads valid stored hymn IDs and removes duplicates', async () => {
    await storeValue({
      schemaVersion: 1,
      hymnIds: ['gbcn-023', 'gbcn-001', 'gbcn-023'],
    });

    await expect(favouritesRepository.load()).resolves.toEqual(['gbcn-023', 'gbcn-001']);
  });

  it.each([
    ['malformed JSON', '{not-json'],
    ['an unsupported schema version', JSON.stringify({ schemaVersion: 2, hymnIds: ['gbcn-023'] })],
    ['an invalid record', JSON.stringify({ schemaVersion: 1, hymnIds: 'gbcn-023' })],
  ])('returns an empty list for %s', async (_caseName, storedValue) => {
    await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, storedValue);

    await expect(favouritesRepository.load()).resolves.toEqual([]);
  });

  it('ignores invalid hymn IDs while loading', async () => {
    await storeValue({
      schemaVersion: 1,
      hymnIds: ['gbcn-023', '', null, 'gbcn-001'],
    });

    await expect(favouritesRepository.load()).resolves.toEqual(['gbcn-023', 'gbcn-001']);
  });

  it('returns an empty list when storage reads fail', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(AsyncStorage.getItem).mockRejectedValueOnce(new Error('read failed'));

    await expect(favouritesRepository.load()).resolves.toEqual([]);
  });

  it('persists valid hymn IDs', async () => {
    const hymnIds = ['gbcn-023', 'gbcn-001'];

    await expect(favouritesRepository.update(hymnIds)).resolves.toEqual(hymnIds);
    await expect(AsyncStorage.getItem(FAVOURITES_STORAGE_KEY)).resolves.toBe(
      JSON.stringify({
        schemaVersion: 1,
        hymnIds,
      }),
    );
  });

  it.each([
    ['duplicate IDs', ['gbcn-023', 'gbcn-023']],
    ['an empty ID', ['gbcn-023', '']],
  ])('rejects %s without writing', async (_caseName, hymnIds) => {
    await expect(favouritesRepository.update(hymnIds)).rejects.toThrow(
      'Invalid favourite hymn IDs.',
    );
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('propagates write failures', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(AsyncStorage.setItem).mockRejectedValueOnce(new Error('write failed'));

    await expect(favouritesRepository.update(['gbcn-023'])).rejects.toThrow('write failed');
  });
});

async function storeValue(value: unknown) {
  await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(value));
}
