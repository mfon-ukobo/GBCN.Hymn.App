import { SQLiteHymnRepository, type HymnRepository } from '@/features/hymns';

import { initializeDatabase } from './initializeDatabase';
import { loadDevelopmentFixtureIfEmpty } from './loadDevelopmentFixture';

let repositoryInitialization: Promise<HymnRepository> | null = null;

export function initializeHymnStorage(): Promise<HymnRepository> {
  if (!repositoryInitialization) {
    repositoryInitialization = initializeDatabase().then(async (database) => {
      const repository = new SQLiteHymnRepository(database);
      if (__DEV__) {
        try {
          await loadDevelopmentFixtureIfEmpty(repository);
        } catch (error: unknown) {
          console.error('Development hymn fixture loading failed.', error);
          throw error;
        }
      }
      return repository;
    });
  }
  return repositoryInitialization;
}
