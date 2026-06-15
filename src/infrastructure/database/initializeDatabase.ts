import type { DatabaseConnection } from './databaseClient';

interface ForeignKeysRow {
  foreign_keys: number;
}

interface QueryOnlyRow {
  query_only: number;
}

interface TableRow {
  name: string;
}

interface MetadataRow {
  key: string;
  value: string;
}

interface CountRow {
  count: number;
}

const REQUIRED_TABLES = [
  'categories',
  'hymn_categories',
  'hymn_lines',
  'hymn_search',
  'hymn_sections',
  'hymns',
  'package_metadata',
] as const;

const EXPECTED_METADATA: Record<string, string> = {
  package_id: 'gbcn-hymns-yo',
  schema_version: '1.0',
  content_version: '1.0.0',
};

const EXPECTED_COUNTS: Record<string, number> = {
  hymns: 654,
  hymn_sections: 3114,
  hymn_lines: 14319,
  hymn_search: 654,
};

export async function initializeHymnDatabase(database: DatabaseConnection): Promise<void> {
  await database.execAsync('PRAGMA foreign_keys = ON');
  const foreignKeys = await database.getFirstAsync<ForeignKeysRow>('PRAGMA foreign_keys');
  if (foreignKeys?.foreign_keys !== 1) {
    throw new Error('SQLite foreign key support could not be enabled.');
  }

  await database.execAsync('PRAGMA query_only = ON');
  const queryOnly = await database.getFirstAsync<QueryOnlyRow>('PRAGMA query_only');
  if (queryOnly?.query_only !== 1) {
    throw new Error('SQLite query-only mode could not be enabled.');
  }

  const tableRows = await database.getAllAsync<TableRow>(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'`,
  );
  const tableNames = new Set(tableRows.map((row) => row.name));
  for (const requiredTable of REQUIRED_TABLES) {
    if (!tableNames.has(requiredTable)) {
      throw new Error(`Bundled hymn database is missing required table "${requiredTable}".`);
    }
  }

  const metadataRows = await database.getAllAsync<MetadataRow>(
    'SELECT key, value FROM package_metadata',
  );
  const metadata = new Map(metadataRows.map((row) => [row.key, row.value]));
  for (const [key, expectedValue] of Object.entries(EXPECTED_METADATA)) {
    const value = metadata.get(key);
    if (value !== expectedValue) {
      throw new Error(
        `Bundled hymn database metadata "${key}" must be "${expectedValue}", received "${value ?? 'missing'}".`,
      );
    }
  }

  for (const [table, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
    const row = await database.getFirstAsync<CountRow>(`SELECT COUNT(*) AS count FROM ${table}`);
    if (row?.count !== expectedCount) {
      throw new Error(
        `Bundled hymn database table "${table}" must contain ${expectedCount} rows, received ${row?.count ?? 'missing'}.`,
      );
    }
  }
}
