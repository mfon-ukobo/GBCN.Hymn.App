import * as SQLite from 'expo-sqlite';
import type { SQLiteBindParams } from 'expo-sqlite';

export const HYMN_DATABASE_NAME = 'gbcn-hymns-1.0.0.db';
export const HYMN_DATABASE_ASSET = require('../../../assets/data/gbcn-hymns-1.0.0.db') as number;

export interface DatabaseConnection {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string, params?: SQLiteBindParams): Promise<T | null>;
  getAllAsync<T>(source: string, params?: SQLiteBindParams): Promise<T[]>;
}

class ExpoDatabaseConnection implements DatabaseConnection {
  constructor(private readonly database: SQLite.SQLiteDatabase) {}

  execAsync(source: string) {
    return this.database.execAsync(source);
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
}

export function createDatabaseConnection(database: SQLite.SQLiteDatabase): DatabaseConnection {
  return new ExpoDatabaseConnection(database);
}
