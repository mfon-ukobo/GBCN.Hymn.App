import type { DatabaseExecutor } from '../databaseClient';

export interface Migration {
  version: number;
  name: string;
  up(database: DatabaseExecutor): Promise<void>;
}
