import type { DatabaseConnection, DatabaseExecutor } from '@/infrastructure/database';

import type { HymnRepository } from './HymnRepository';
import {
  type HymnCategoryReferenceRow,
  type HymnCategoryRow,
  type HymnRow,
  type HymnSectionLineRow,
  type HymnSummaryRow,
  mapHymn,
  mapHymnCategory,
  mapHymnSummaries,
} from './hymnMappers';
import { validateCatalogue } from './validateCatalogue';
import type { Hymn, HymnSummary } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';

const HYMN_SUMMARY_SELECT = `
  SELECT h.id, h.number, h.title, hc.category_id
  FROM hymns h
  LEFT JOIN hymn_categories hc ON hc.hymn_id = h.id
`;

const HYMN_SELECT = 'SELECT id, number, title FROM hymns';

export class SQLiteHymnRepository implements HymnRepository {
  constructor(private readonly database: DatabaseConnection) {}

  async getAllHymns(): Promise<HymnSummary[]> {
    const rows = await this.database.getAllAsync<HymnSummaryRow>(
      `${HYMN_SUMMARY_SELECT} ORDER BY h.number ASC, hc.category_order ASC`,
    );
    return mapHymnSummaries(rows);
  }

  async getHymnById(id: string): Promise<Hymn | null> {
    const row = await this.database.getFirstAsync<HymnRow>(`${HYMN_SELECT} WHERE id = ?`, [id]);
    return this.getHymnWithDetails(row);
  }

  async getHymnByNumber(number: number): Promise<Hymn | null> {
    const row = await this.database.getFirstAsync<HymnRow>(`${HYMN_SELECT} WHERE number = ?`, [
      number,
    ]);
    return this.getHymnWithDetails(row);
  }

  async getHymnsByCategory(categoryId: string): Promise<HymnSummary[]> {
    const rows = await this.database.getAllAsync<HymnSummaryRow>(
      `${HYMN_SUMMARY_SELECT}
       WHERE h.id IN (SELECT hymn_id FROM hymn_categories WHERE category_id = ?)
       ORDER BY h.number ASC, hc.category_order ASC`,
      [categoryId],
    );
    return mapHymnSummaries(rows);
  }

  async getCategories(): Promise<HymnCategory[]> {
    const rows = await this.database.getAllAsync<HymnCategoryRow>(
      `SELECT id, name, sort_order
       FROM categories
       ORDER BY sort_order IS NULL ASC, sort_order ASC, name ASC`,
    );
    return rows.map(mapHymnCategory);
  }

  async replaceCatalogue(catalogue: unknown): Promise<void> {
    const validatedCatalogue = validateCatalogue(catalogue);

    await this.database.withTransactionAsync(async (transaction) => {
      await transaction.runAsync('DELETE FROM hymn_section_lines');
      await transaction.runAsync('DELETE FROM hymn_sections');
      await transaction.runAsync('DELETE FROM hymn_categories');
      await transaction.runAsync('DELETE FROM hymns');
      await transaction.runAsync('DELETE FROM categories');

      for (const category of validatedCatalogue.categories) {
        await transaction.runAsync(
          'INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)',
          [category.id, category.name, category.sortOrder ?? null],
        );
      }

      for (const hymn of validatedCatalogue.hymns) {
        await this.insertHymn(transaction, hymn);
      }
    });
  }

  private async getHymnWithDetails(row: HymnRow | null): Promise<Hymn | null> {
    if (!row) {
      return null;
    }

    const categoryRows = await this.database.getAllAsync<HymnCategoryReferenceRow>(
      `SELECT category_id
       FROM hymn_categories
       WHERE hymn_id = ?
       ORDER BY category_order ASC`,
      [row.id],
    );
    const sectionRows = await this.database.getAllAsync<HymnSectionLineRow>(
      `SELECT
         hs.section_type,
         hs.section_order,
         hs.section_number,
         hs.label,
         hsl.line_order,
         hsl.content
       FROM hymn_sections hs
       INNER JOIN hymn_section_lines hsl
         ON hsl.hymn_id = hs.hymn_id AND hsl.section_order = hs.section_order
       WHERE hs.hymn_id = ?
       ORDER BY hs.section_order ASC, hsl.line_order ASC`,
      [row.id],
    );
    return mapHymn(row, categoryRows, sectionRows);
  }

  private async insertHymn(database: DatabaseExecutor, hymn: Hymn) {
    await database.runAsync('INSERT INTO hymns (id, number, title) VALUES (?, ?, ?)', [
      hymn.id,
      hymn.number,
      hymn.title,
    ]);

    for (let categoryIndex = 0; categoryIndex < hymn.categoryIds.length; categoryIndex += 1) {
      await database.runAsync(
        `INSERT INTO hymn_categories (hymn_id, category_id, category_order)
         VALUES (?, ?, ?)`,
        [hymn.id, hymn.categoryIds[categoryIndex], categoryIndex + 1],
      );
    }

    for (const section of hymn.sections) {
      await database.runAsync(
        `INSERT INTO hymn_sections (hymn_id, section_order, section_type, section_number, label)
         VALUES (?, ?, ?, ?, ?)`,
        [hymn.id, section.order, section.type, section.number ?? null, section.label ?? null],
      );
      for (let lineIndex = 0; lineIndex < section.lines.length; lineIndex += 1) {
        await database.runAsync(
          `INSERT INTO hymn_section_lines (hymn_id, section_order, line_order, content)
           VALUES (?, ?, ?, ?)`,
          [hymn.id, section.order, lineIndex + 1, section.lines[lineIndex]],
        );
      }
    }
  }
}
