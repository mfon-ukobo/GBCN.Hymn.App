import type { HymnSection } from './HymnSection';

export interface Hymn {
  id: string;
  number: number;
  title: string;
  categoryIds: string[];
  sections: HymnSection[];
}

export type HymnSummary = Pick<Hymn, 'id' | 'number' | 'title' | 'categoryIds'>;
