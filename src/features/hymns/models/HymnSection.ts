export const HYMN_SECTION_TYPES = ['verse', 'chorus', 'refrain', 'other'] as const;

export type HymnSectionType = (typeof HYMN_SECTION_TYPES)[number];

export interface HymnSection {
  id: string;
  hymnId: string;
  sectionType: HymnSectionType;
  sectionNumber: number | null;
  label: string | null;
  content: string;
  sortOrder: number;
}
