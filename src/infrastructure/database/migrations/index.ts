import { createHymnStorageMigration } from './001CreateHymnStorage';
import type { Migration } from './Migration';

export const databaseMigrations: Migration[] = [createHymnStorageMigration];

export type { Migration };
