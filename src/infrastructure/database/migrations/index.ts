import { createHymnStorageMigration } from './001CreateHymnStorage';
import { createCanonicalHymnStorageMigration } from './002CreateCanonicalHymnStorage';
import type { Migration } from './Migration';

export const databaseMigrations: Migration[] = [
  createHymnStorageMigration,
  createCanonicalHymnStorageMigration,
];

export type { Migration };
