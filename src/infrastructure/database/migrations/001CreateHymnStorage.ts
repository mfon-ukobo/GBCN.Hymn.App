import type { Migration } from './Migration';

export const createHymnStorageMigration: Migration = {
  version: 1,
  name: '001_create_hymn_storage',
  async up(database) {
    await database.execAsync(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE hymns (
        id TEXT PRIMARY KEY NOT NULL,
        number INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
        language TEXT NOT NULL DEFAULT 'en',
        plain_text TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE hymn_sections (
        id TEXT PRIMARY KEY NOT NULL,
        hymn_id TEXT NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
        section_type TEXT NOT NULL CHECK (section_type IN ('verse', 'chorus', 'refrain', 'other')),
        section_number INTEGER,
        label TEXT,
        content TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      );

      CREATE INDEX idx_hymns_number ON hymns(number);
      CREATE INDEX idx_hymns_title ON hymns(title);
      CREATE INDEX idx_hymns_category_id ON hymns(category_id);
      CREATE INDEX idx_hymn_sections_hymn_id ON hymn_sections(hymn_id);
      CREATE INDEX idx_hymns_sort_order ON hymns(sort_order, number);
    `);
  },
};
