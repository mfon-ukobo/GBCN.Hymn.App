import type { Hymn, HymnSummary } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';
import type { HymnSection, HymnSectionType } from '../models/HymnSection';

export interface HymnRow {
  id: string;
  number: number;
  title: string;
}

export interface HymnSummaryRow extends HymnRow {
  category_id: string | null;
}

export interface HymnCategoryReferenceRow {
  category_id: string;
}

export interface HymnSectionLineRow {
  section_type: HymnSectionType;
  section_order: number;
  section_number: number | null;
  label: string | null;
  line_order: number;
  content: string;
}

export interface HymnCategoryRow {
  id: string;
  name: string;
  sort_order: number | null;
}

export function mapHymnSummaries(rows: HymnSummaryRow[]): HymnSummary[] {
  const summaries = new Map<string, HymnSummary>();
  for (const row of rows) {
    let summary = summaries.get(row.id);
    if (!summary) {
      summary = {
        id: row.id,
        number: row.number,
        title: row.title,
        categoryIds: [],
      };
      summaries.set(row.id, summary);
    }
    if (row.category_id !== null) {
      summary.categoryIds.push(row.category_id);
    }
  }
  return [...summaries.values()];
}

export function mapHymn(
  row: HymnRow,
  categoryRows: HymnCategoryReferenceRow[],
  sectionRows: HymnSectionLineRow[],
): Hymn {
  const sections = new Map<number, HymnSection>();
  for (const sectionRow of sectionRows) {
    let section = sections.get(sectionRow.section_order);
    if (!section) {
      section = {
        type: sectionRow.section_type,
        order: sectionRow.section_order,
        ...(sectionRow.section_number === null ? {} : { number: sectionRow.section_number }),
        ...(sectionRow.label === null ? {} : { label: sectionRow.label }),
        lines: [],
      };
      sections.set(sectionRow.section_order, section);
    }
    section.lines.push(sectionRow.content);
  }

  return {
    id: row.id,
    number: row.number,
    title: row.title,
    categoryIds: categoryRows.map((category) => category.category_id),
    sections: [...sections.values()],
  };
}

export function mapHymnCategory(row: HymnCategoryRow): HymnCategory {
  return {
    id: row.id,
    name: row.name,
    ...(row.sort_order === null ? {} : { sortOrder: row.sort_order }),
  };
}
