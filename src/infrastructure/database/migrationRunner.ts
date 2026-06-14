import type { DatabaseConnection } from './databaseClient';
import type { Migration } from './migrations';

interface AppliedMigrationRow {
  version: number;
}

export async function runMigrations(database: DatabaseConnection, migrations: Migration[]) {
  const orderedMigrations = [...migrations].sort((left, right) => left.version - right.version);
  const versions = new Set<number>();

  for (const migration of orderedMigrations) {
    if (!Number.isInteger(migration.version) || migration.version <= 0 || versions.has(migration.version)) {
      throw new Error(`Invalid or duplicate database migration version ${migration.version}.`);
    }
    versions.add(migration.version);
  }

  const appliedRows = await database.getAllAsync<AppliedMigrationRow>(
    'SELECT version FROM schema_migrations ORDER BY version ASC',
  );
  const appliedVersions = new Set(appliedRows.map((row) => row.version));

  for (const migration of orderedMigrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    await database.withTransactionAsync(async (transaction) => {
      await migration.up(transaction);
      await transaction.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)',
        [migration.version, migration.name, new Date().toISOString()],
      );
    });
  }
}
