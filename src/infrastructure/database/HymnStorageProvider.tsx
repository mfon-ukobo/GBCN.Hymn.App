import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { type PropsWithChildren, useMemo } from 'react';

import {
  HymnRepositoryProvider,
  SQLiteHymnRepository,
} from '@/features/hymns';

import {
  createDatabaseConnection,
  HYMN_DATABASE_ASSET,
  HYMN_DATABASE_NAME,
} from './databaseClient';
import { initializeHymnDatabase } from './initializeDatabase';

const assetSource = { assetId: HYMN_DATABASE_ASSET };

function initializeDatabase(database: SQLiteDatabase) {
  return initializeHymnDatabase(createDatabaseConnection(database));
}

export function HymnStorageProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider
      assetSource={assetSource}
      databaseName={HYMN_DATABASE_NAME}
      onInit={initializeDatabase}
      useSuspense
    >
      <RepositoryBridge>{children}</RepositoryBridge>
    </SQLiteProvider>
  );
}

function RepositoryBridge({ children }: PropsWithChildren) {
  const database = useSQLiteContext();
  const repository = useMemo(
    () => new SQLiteHymnRepository(createDatabaseConnection(database)),
    [database],
  );

  return <HymnRepositoryProvider repository={repository}>{children}</HymnRepositoryProvider>;
}
