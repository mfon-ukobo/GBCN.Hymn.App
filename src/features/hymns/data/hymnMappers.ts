import type { Hymn, HymnSummary } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';
import type { HymnSection, HymnSectionType } from '../models/HymnSection';

export interface HymnRow {
  id: string;
  number: number;
  title: string;
  category_id: string | null;
  language: string;
  plain_text: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type HymnSummaryRow = Pick<
  HymnRow,
  'id' | 'number' | 'title' | 'category_id' | 'language' | 'sort_order'
>;

export interface HymnSectionRow {
  id: string;
  hymn_id: string;
  section_type: HymnSectionType;
  section_number: number | null;
  label: string | null;
  content: string;
  sort_order: number;
}

export interface HymnCategoryRow {
  id: string;
  name: string;
  sort_order: number;
}

export function mapHymnSummary(row: HymnSummaryRow): HymnSummary {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    categoryId: row.category_id,
    language: row.language,
    sortOrder: row.sort_order,
  };
}

export function mapHymn(row: HymnRow, sections: HymnSection[]): Hymn {
  return {
    ...mapHymnSummary(row),
    plainText: row.plain_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sections,
  };
}

export function mapHymnSection(row: HymnSectionRow): HymnSection {
  return {
    id: row.id,
    hymnId: row.hymn_id,
    sectionType: row.section_type,
    sectionNumber: row.section_number,
    label: row.label,
    content: row.content,
    sortOrder: row.sort_order,
  };
}

export function mapHymnCategory(row: HymnCategoryRow): HymnCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}
