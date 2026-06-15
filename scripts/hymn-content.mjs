import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const CONTENT_DATABASE_FILE = 'gbcn-hymns-1.0.0.db';
export const CONTENT_DATABASE_SHA256 =
  '3732818a5b64b5c6ade5cc3e715ba65e9dbb7588b94a076dfd3f5ef146ede88c';
export const CONTENT_DATABASE_SOURCE_PATH = 'database/gbcn_hymns.sqlite';
export const CONTENT_PACKAGE_DIRECTORY = resolve('..', 'GBCN_Hymn_Offline_Content_v1.0.0');
export const CONTENT_PACKAGE_MANIFEST = resolve(CONTENT_PACKAGE_DIRECTORY, 'manifest.json');
export const CONTENT_SOURCE_DATABASE = resolve(
  CONTENT_PACKAGE_DIRECTORY,
  CONTENT_DATABASE_SOURCE_PATH,
);
export const CONTENT_TARGET_DATABASE = resolve('assets', 'data', CONTENT_DATABASE_FILE);

const EXPECTED_METADATA = {
  package_id: 'gbcn-hymns-yo',
  schema_version: '1.0',
  content_version: '1.0.0',
};

const EXPECTED_COUNTS = {
  hymns: 654,
  hymn_sections: 3114,
  hymn_lines: 14319,
  hymn_search: 654,
};

export function calculateSha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function verifyManifestSource() {
  if (!existsSync(CONTENT_PACKAGE_MANIFEST)) {
    throw new Error(`Offline content manifest not found: ${CONTENT_PACKAGE_MANIFEST}`);
  }

  const manifest = JSON.parse(readFileSync(CONTENT_PACKAGE_MANIFEST, 'utf8'));
  const databaseEntry = manifest.files?.find(
    (entry) => entry.path === CONTENT_DATABASE_SOURCE_PATH,
  );

  if (!databaseEntry) {
    throw new Error(`Manifest does not contain ${CONTENT_DATABASE_SOURCE_PATH}.`);
  }
  if (databaseEntry.sha256 !== CONTENT_DATABASE_SHA256) {
    throw new Error(
      `Manifest checksum mismatch. Expected ${CONTENT_DATABASE_SHA256}, received ${databaseEntry.sha256}.`,
    );
  }

  verifyChecksum(CONTENT_SOURCE_DATABASE);
}

export function verifyContentDatabase(path = CONTENT_TARGET_DATABASE) {
  if (!existsSync(path)) {
    throw new Error(`Bundled hymn database not found: ${path}`);
  }

  verifyChecksum(path);

  const database = new DatabaseSync(path, { readOnly: true });
  try {
    const integrity = database.prepare('PRAGMA integrity_check').get();
    if (integrity?.integrity_check !== 'ok') {
      throw new Error(`SQLite integrity check failed: ${integrity?.integrity_check ?? 'unknown'}`);
    }

    const metadata = Object.fromEntries(
      database.prepare('SELECT key, value FROM package_metadata').all().map((row) => [
        row.key,
        row.value,
      ]),
    );
    for (const [key, expectedValue] of Object.entries(EXPECTED_METADATA)) {
      if (metadata[key] !== expectedValue) {
        throw new Error(
          `Metadata ${key} mismatch. Expected ${expectedValue}, received ${metadata[key] ?? 'missing'}.`,
        );
      }
    }

    for (const [table, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
      const row = database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
      if (row?.count !== expectedCount) {
        throw new Error(
          `${table} count mismatch. Expected ${expectedCount}, received ${row?.count ?? 'missing'}.`,
        );
      }
    }
  } finally {
    database.close();
  }
}

function verifyChecksum(path) {
  const checksum = calculateSha256(path);
  if (checksum !== CONTENT_DATABASE_SHA256) {
    throw new Error(
      `Checksum mismatch for ${path}. Expected ${CONTENT_DATABASE_SHA256}, received ${checksum}.`,
    );
  }
}
