import type { Migration } from './Migration';

export const createCanonicalHymnStorageMigration: Migration = {
  version: 2,
  name: '002_create_canonical_hymn_storage',
  async up(database) {
    await database.execAsync(`
      DROP TABLE hymn_sections;
      DROP TABLE hymns;
      DROP TABLE categories;

      CREATE TABLE categories (
        id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0 AND id = trim(id)),
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        sort_order REAL
      );

      CREATE TABLE hymns (
        id TEXT PRIMARY KEY NOT NULL CHECK (length(id) > 0 AND id = trim(id)),
        number INTEGER NOT NULL UNIQUE CHECK (number > 0),
        title TEXT NOT NULL CHECK (length(trim(title)) > 0)
      );

      CREATE TABLE hymn_categories (
        hymn_id TEXT NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        category_order INTEGER NOT NULL CHECK (category_order > 0),
        PRIMARY KEY (hymn_id, category_id),
        UNIQUE (hymn_id, category_order)
      );

      CREATE TABLE hymn_sections (
        hymn_id TEXT NOT NULL REFERENCES hymns(id) ON DELETE CASCADE,
        section_order INTEGER NOT NULL CHECK (section_order > 0),
        section_type TEXT NOT NULL CHECK (section_type IN ('verse', 'chorus')),
        section_number INTEGER CHECK (section_number > 0),
        label TEXT,
        PRIMARY KEY (hymn_id, section_order),
        CHECK (section_type != 'verse' OR section_number IS NOT NULL)
      );

      CREATE TABLE hymn_section_lines (
        hymn_id TEXT NOT NULL,
        section_order INTEGER NOT NULL,
        line_order INTEGER NOT NULL CHECK (line_order > 0),
        content TEXT NOT NULL,
        PRIMARY KEY (hymn_id, section_order, line_order),
        FOREIGN KEY (hymn_id, section_order)
          REFERENCES hymn_sections(hymn_id, section_order)
          ON DELETE CASCADE
      );

      CREATE INDEX idx_hymns_number ON hymns(number);
      CREATE INDEX idx_hymns_title ON hymns(title);
      CREATE INDEX idx_hymn_categories_category_id ON hymn_categories(category_id);
      CREATE INDEX idx_hymn_sections_hymn_id ON hymn_sections(hymn_id);
      CREATE INDEX idx_hymn_section_lines_hymn_id ON hymn_section_lines(hymn_id);
    `);
  },
};
