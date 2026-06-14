import type { DatabaseConnection, DatabaseExecutor } from './databaseClient';
import { createDatabaseInitializer } from './initializeDatabase';

function createDatabase(): DatabaseConnection & {
  execAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  runAsync: jest.Mock;
  withTransactionAsync: jest.Mock;
} {
  const database = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue({ foreign_keys: 1 }),
    runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
    withTransactionAsync: jest.fn(),
  };
  database.withTransactionAsync.mockImplementation(
    async (task: (transaction: DatabaseExecutor) => Promise<void>) => task(database),
  );
  return database as DatabaseConnection & typeof database;
}

describe('initializeDatabase', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates the canonical schema, records migrations, and initializes once per session', async () => {
    const database = createDatabase();
    const openDatabase = jest.fn().mockResolvedValue(database);
    const initialize = createDatabaseInitializer({ openDatabase });

    const first = await initialize();
    const second = await initialize();

    expect(first).toBe(database);
    expect(second).toBe(database);
    expect(openDatabase).toHaveBeenCalledTimes(1);
    expect(database.withTransactionAsync).toHaveBeenCalledTimes(2);
    expect(database.execAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON');
    expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE categories'));
    expect(database.execAsync).toHaveBeenCalledWith(expect.stringContaining('ON DELETE CASCADE'));
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE hymn_categories'),
    );
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE hymn_section_lines'),
    );
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CHECK (section_type != 'verse' OR section_number IS NOT NULL)"),
    );
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE hymn_sections'),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO schema_migrations'),
      expect.arrayContaining([1, '001_create_hymn_storage']),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO schema_migrations'),
      expect.arrayContaining([2, '002_create_canonical_hymn_storage']),
    );
  });

  it('does not execute completed migrations again', async () => {
    const database = createDatabase();
    database.getAllAsync.mockResolvedValue([{ version: 1 }, { version: 2 }]);
    const initialize = createDatabaseInitializer({
      openDatabase: jest.fn().mockResolvedValue(database),
    });

    await initialize();

    expect(database.withTransactionAsync).not.toHaveBeenCalled();
    expect(database.runAsync).not.toHaveBeenCalled();
  });

  it('resets the old hymn catalogue while upgrading schema version 1', async () => {
    const database = createDatabase();
    database.getAllAsync.mockResolvedValue([{ version: 1 }]);
    const initialize = createDatabaseInitializer({
      openDatabase: jest.fn().mockResolvedValue(database),
    });

    await initialize();

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('DROP TABLE hymn_sections'),
    );
    expect(database.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE hymn_section_lines'),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO schema_migrations'),
      expect.arrayContaining([2, '002_create_canonical_hymn_storage']),
    );
  });

  it('rejects and retains a failed initialization result without recreating the database', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const database = createDatabase();
    database.withTransactionAsync.mockRejectedValue(new Error('migration failed'));
    const openDatabase = jest.fn().mockResolvedValue(database);
    const initialize = createDatabaseInitializer({ openDatabase });

    await expect(initialize()).rejects.toThrow('migration failed');
    await expect(initialize()).rejects.toThrow('migration failed');

    expect(openDatabase).toHaveBeenCalledTimes(1);
  });
});
