import { openHymnDatabase, type DatabaseConnection } from './databaseClient';
import { databaseMigrations, type Migration } from './migrations';
import { runMigrations } from './migrationRunner';

interface DatabaseInitializerOptions {
  openDatabase?: () => Promise<DatabaseConnection>;
  migrations?: Migration[];
}

interface ForeignKeysRow {
  foreign_keys: number;
}

export function createDatabaseInitializer(options: DatabaseInitializerOptions = {}) {
  const openDatabase = options.openDatabase ?? openHymnDatabase;
  const migrations = options.migrations ?? databaseMigrations;
  let initialization: Promise<DatabaseConnection> | null = null;

  return function initializeDatabase() {
    if (!initialization) {
      initialization = initialize(openDatabase, migrations).catch((error: unknown) => {
        console.error('Hymn database initialization failed.', error);
        throw error;
      });
    }
    return initialization;
  };
}

async function initialize(
  openDatabase: () => Promise<DatabaseConnection>,
  migrations: Migration[],
): Promise<DatabaseConnection> {
  const database = await openDatabase();
  await database.execAsync('PRAGMA journal_mode = WAL');
  await database.execAsync('PRAGMA foreign_keys = ON');

  const foreignKeys = await database.getFirstAsync<ForeignKeysRow>('PRAGMA foreign_keys');
  if (foreignKeys?.foreign_keys !== 1) {
    throw new Error('SQLite foreign key support could not be enabled.');
  }

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);
  await runMigrations(database, migrations);
  return database;
}

export const initializeDatabase = createDatabaseInitializer();
