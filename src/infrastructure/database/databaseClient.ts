import * as SQLite from 'expo-sqlite';
import type { SQLiteBindParams, SQLiteRunResult } from 'expo-sqlite';

export const HYMN_DATABASE_NAME = 'gbcn-hymns.db';

export interface DatabaseExecutor {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: SQLiteBindParams): Promise<SQLiteRunResult>;
  getFirstAsync<T>(source: string, params?: SQLiteBindParams): Promise<T | null>;
  getAllAsync<T>(source: string, params?: SQLiteBindParams): Promise<T[]>;
}

export interface DatabaseConnection extends DatabaseExecutor {
  withTransactionAsync(task: (transaction: DatabaseExecutor) => Promise<void>): Promise<void>;
}

class ExpoDatabaseConnection implements DatabaseConnection {
  constructor(private readonly database: SQLite.SQLiteDatabase) {}

  execAsync(source: string) {
    return this.database.execAsync(source);
  }

  runAsync(source: string, params?: SQLiteBindParams) {
    return params === undefined ? this.database.runAsync(source) : this.database.runAsync(source, params);
  }

  getFirstAsync<T>(source: string, params?: SQLiteBindParams) {
    return params === undefined
      ? this.database.getFirstAsync<T>(source)
      : this.database.getFirstAsync<T>(source, params);
  }

  getAllAsync<T>(source: string, params?: SQLiteBindParams) {
    return params === undefined
      ? this.database.getAllAsync<T>(source)
      : this.database.getAllAsync<T>(source, params);
  }

  withTransactionAsync(task: (transaction: DatabaseExecutor) => Promise<void>) {
    return this.database.withTransactionAsync(() => task(this));
  }
}

export async function openHymnDatabase(): Promise<DatabaseConnection> {
  const database = await SQLite.openDatabaseAsync(HYMN_DATABASE_NAME);
  return new ExpoDatabaseConnection(database);
}
