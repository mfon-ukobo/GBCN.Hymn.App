import type { DatabaseConnection, DatabaseExecutor } from '@/infrastructure/database';

import type { HymnRepository } from './HymnRepository';
import {
  type HymnCategoryRow,
  type HymnRow,
  type HymnSectionRow,
  type HymnSummaryRow,
  mapHymn,
  mapHymnCategory,
  mapHymnSection,
  mapHymnSummary,
} from './hymnMappers';
import { validateCatalogue } from './validateCatalogue';
import type { Hymn, HymnCatalogue, HymnSummary } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';

const HYMN_SUMMARY_SELECT = `
  SELECT id, number, title, category_id, language, sort_order
  FROM hymns
`;

const HYMN_SELECT = `
  SELECT id, number, title, category_id, language, plain_text, sort_order, created_at, updated_at
  FROM hymns
`;

export class SQLiteHymnRepository implements HymnRepository {
  constructor(private readonly database: DatabaseConnection) {}

  async getAllHymns(): Promise<HymnSummary[]> {
    const rows = await this.database.getAllAsync<HymnSummaryRow>(
      `${HYMN_SUMMARY_SELECT} ORDER BY sort_order ASC, number ASC`,
    );
    return rows.map(mapHymnSummary);
  }

  async getHymnById(id: string): Promise<Hymn | null> {
    const row = await this.database.getFirstAsync<HymnRow>(`${HYMN_SELECT} WHERE id = ?`, [id]);
    return this.getHymnWithSections(row);
  }

  async getHymnByNumber(number: number): Promise<Hymn | null> {
    const row = await this.database.getFirstAsync<HymnRow>(`${HYMN_SELECT} WHERE number = ?`, [
      number,
    ]);
    return this.getHymnWithSections(row);
  }

  async getHymnsByCategory(categoryId: string): Promise<HymnSummary[]> {
    const rows = await this.database.getAllAsync<HymnSummaryRow>(
      `${HYMN_SUMMARY_SELECT} WHERE category_id = ? ORDER BY sort_order ASC, number ASC`,
      [categoryId],
    );
    return rows.map(mapHymnSummary);
  }

  async getCategories(): Promise<HymnCategory[]> {
    const rows = await this.database.getAllAsync<HymnCategoryRow>(
      `SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC, name ASC`,
    );
    return rows.map(mapHymnCategory);
  }

  async replaceCatalogue(catalogue: HymnCatalogue): Promise<void> {
    validateCatalogue(catalogue);

    await this.database.withTransactionAsync(async (transaction) => {
      await transaction.runAsync('DELETE FROM hymn_sections');
      await transaction.runAsync('DELETE FROM hymns');
      await transaction.runAsync('DELETE FROM categories');

      for (const category of catalogue.categories) {
        await transaction.runAsync(
          'INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)',
          [category.id, category.name, category.sortOrder],
        );
      }

      for (const hymn of catalogue.hymns) {
        await this.insertHymn(transaction, hymn);
      }
    });
  }

  private async getHymnWithSections(row: HymnRow | null): Promise<Hymn | null> {
    if (!row) {
      return null;
    }

    const sectionRows = await this.database.getAllAsync<HymnSectionRow>(
      `SELECT id, hymn_id, section_type, section_number, label, content, sort_order
       FROM hymn_sections
       WHERE hymn_id = ?
       ORDER BY sort_order ASC, section_number ASC`,
      [row.id],
    );
    return mapHymn(row, sectionRows.map(mapHymnSection));
  }

  private async insertHymn(database: DatabaseExecutor, hymn: Hymn) {
    await database.runAsync(
      `INSERT INTO hymns (
        id, number, title, category_id, language, plain_text, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hymn.id,
        hymn.number,
        hymn.title,
        hymn.categoryId,
        hymn.language,
        hymn.plainText,
        hymn.sortOrder,
        hymn.createdAt,
        hymn.updatedAt,
      ],
    );

    for (const section of hymn.sections) {
      await database.runAsync(
        `INSERT INTO hymn_sections (
          id, hymn_id, section_type, section_number, label, content, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          section.id,
          section.hymnId,
          section.sectionType,
          section.sectionNumber,
          section.label,
          section.content,
          section.sortOrder,
        ],
      );
    }
  }
}
