import type { DatabaseConnection } from './databaseClient';
import { initializeHymnDatabase } from './initializeDatabase';

const requiredTables = [
  'categories',
  'hymn_categories',
  'hymn_lines',
  'hymn_search',
  'hymn_sections',
  'hymns',
  'package_metadata',
].map((name) => ({ name }));

const validMetadata = [
  { key: 'package_id', value: 'gbcn-hymns-yo' },
  { key: 'schema_version', value: '1.0' },
  { key: 'content_version', value: '1.0.0' },
];

const counts: Record<string, number> = {
  hymns: 654,
  hymn_sections: 3114,
  hymn_lines: 14319,
  hymn_search: 654,
};

function createDatabase({
  metadata = validMetadata,
  tables = requiredTables,
  tableCounts = counts,
}: {
  metadata?: { key: string; value: string }[];
  tables?: { name: string }[];
  tableCounts?: Record<string, number>;
} = {}): DatabaseConnection & {
  execAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
} {
  const database = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn(async (source: string) =>
      source.includes('sqlite_master') ? tables : metadata,
    ),
    getFirstAsync: jest.fn(async (source: string) => {
      if (source === 'PRAGMA foreign_keys') {
        return { foreign_keys: 1 };
      }
      if (source === 'PRAGMA query_only') {
        return { query_only: 1 };
      }
      const table = Object.keys(tableCounts).find((name) => source.includes(`FROM ${name}`));
      return table ? { count: tableCounts[table] } : null;
    }),
  };
  return database as DatabaseConnection & typeof database;
}

describe('initializeHymnDatabase', () => {
  it('enables read-only safeguards and validates the bundled content contract', async () => {
    const database = createDatabase();

    await initializeHymnDatabase(database);

    expect(database.execAsync).toHaveBeenNthCalledWith(1, 'PRAGMA foreign_keys = ON');
    expect(database.execAsync).toHaveBeenNthCalledWith(2, 'PRAGMA query_only = ON');
    expect(database.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('sqlite_master'));
    expect(database.getAllAsync).toHaveBeenCalledWith('SELECT key, value FROM package_metadata');
  });

  it('rejects a database with a missing required table', async () => {
    const database = createDatabase({ tables: requiredTables.filter(({ name }) => name !== 'hymns') });

    await expect(initializeHymnDatabase(database)).rejects.toThrow(
      'missing required table "hymns"',
    );
  });

  it('rejects mismatched package metadata', async () => {
    const database = createDatabase({
      metadata: validMetadata.map((row) =>
        row.key === 'content_version' ? { ...row, value: '2.0.0' } : row,
      ),
    });

    await expect(initializeHymnDatabase(database)).rejects.toThrow(
      'metadata "content_version" must be "1.0.0"',
    );
  });

  it('rejects unexpected content counts', async () => {
    const database = createDatabase({
      tableCounts: { ...counts, hymns: 653 },
    });

    await expect(initializeHymnDatabase(database)).rejects.toThrow(
      'table "hymns" must contain 654 rows',
    );
  });
});
