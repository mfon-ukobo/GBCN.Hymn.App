import type { Hymn, HymnSummary } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';

export interface HymnRepository {
  getAllHymns(): Promise<HymnSummary[]>;
  getHymnById(id: string): Promise<Hymn | null>;
  getHymnByNumber(number: number): Promise<Hymn | null>;
  getHymnsByCategory(categoryId: string): Promise<HymnSummary[]>;
  getCategories(): Promise<HymnCategory[]>;
  searchHymns(query: string): Promise<HymnSummary[]>;
}
