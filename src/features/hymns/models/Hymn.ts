import type { HymnCategory } from './HymnCategory';
import type { HymnSection } from './HymnSection';

export interface HymnSummary {
  id: string;
  number: number;
  title: string;
  categoryId: string | null;
  language: string;
  sortOrder: number;
}

export interface Hymn extends HymnSummary {
  plainText: string;
  createdAt: string;
  updatedAt: string;
  sections: HymnSection[];
}

export interface HymnCatalogue {
  categories: HymnCategory[];
  hymns: Hymn[];
}
