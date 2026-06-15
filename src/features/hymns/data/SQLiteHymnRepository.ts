import type { DatabaseConnection } from '@/infrastructure/database';

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
import { createFtsPrefixQuery, normalizeSearchQuery } from './normalizeSearchQuery';
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
      `${HYMN_SUMMARY_SELECT} ORDER BY h.number ASC, hc.category_id ASC`,
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
       ORDER BY h.number ASC, hc.category_id ASC`,
      [categoryId],
    );
    return mapHymnSummaries(rows);
  }

  async getCategories(): Promise<HymnCategory[]> {
    const rows = await this.database.getAllAsync<HymnCategoryRow>(
      `SELECT id, name, position AS sort_order
       FROM categories
       ORDER BY position ASC, name ASC`,
    );
    return rows.map(mapHymnCategory);
  }

  async searchHymns(query: string): Promise<HymnSummary[]> {
    const normalizedQuery = normalizeSearchQuery(query);
    if (normalizedQuery.length === 0) {
      return [];
    }

    if (/^\d+$/.test(normalizedQuery)) {
      const rows = await this.database.getAllAsync<HymnSummaryRow>(
        `${HYMN_SUMMARY_SELECT}
         WHERE h.number = ?
         ORDER BY hc.category_id ASC`,
        [Number(normalizedQuery)],
      );
      return mapHymnSummaries(rows);
    }

    const ftsQuery = createFtsPrefixQuery(normalizedQuery);
    const rows = await this.database.getAllAsync<HymnSummaryRow>(
      `${HYMN_SUMMARY_SELECT}
       INNER JOIN hymn_search hs ON hs.hymn_id = h.id
       WHERE hymn_search MATCH ?
       ORDER BY
         CASE
           WHEN h.title_search = ? THEN 0
           WHEN h.title_search LIKE ? THEN 1
           ELSE 2
         END,
         h.number ASC,
         hc.category_id ASC`,
      [ftsQuery, normalizedQuery, `${normalizedQuery}%`],
    );
    return mapHymnSummaries(rows);
  }

  private async getHymnWithDetails(row: HymnRow | null) {
    if (!row) {
      return null;
    }

    const categoryRows = await this.database.getAllAsync<HymnCategoryReferenceRow>(
      `SELECT category_id
       FROM hymn_categories
       WHERE hymn_id = ?
       ORDER BY category_id ASC`,
      [row.id],
    );
    const sectionRows = await this.database.getAllAsync<HymnSectionLineRow>(
      `SELECT
         hs.section_type,
         hs.position AS section_order,
         hs.section_number,
         hs.label,
         hl.position AS line_order,
         hl.text AS content
       FROM hymn_sections hs
       INNER JOIN hymn_lines hl ON hl.section_id = hs.id
       WHERE hs.hymn_id = ?
       ORDER BY hs.position ASC, hl.position ASC`,
      [row.id],
    );
    return mapHymn(row, categoryRows, sectionRows);
  }
}
