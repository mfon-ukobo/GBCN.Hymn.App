import type { HymnCategory } from './HymnCategory';
import type { HymnSection } from './HymnSection';

export interface Hymn {
  id: string;
  number: number;
  title: string;
  categoryIds: string[];
  sections: HymnSection[];
}

export type HymnSummary = Pick<Hymn, 'id' | 'number' | 'title' | 'categoryIds'>;

export interface HymnCatalogue {
  categories: HymnCategory[];
  hymns: Hymn[];
}
