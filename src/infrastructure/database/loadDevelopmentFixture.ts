import sampleCatalogue from '../../../assets/data/hymns.sample.json';

import { type HymnRepository } from '@/features/hymns';

export async function loadDevelopmentFixtureIfEmpty(repository: HymnRepository) {
  const existingHymns = await repository.getAllHymns();
  if (existingHymns.length === 0) {
    await repository.replaceCatalogue(sampleCatalogue);
  }
}
