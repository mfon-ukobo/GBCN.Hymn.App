import type { HymnRepository } from '@/features/hymns';

import { loadDevelopmentFixtureIfEmpty } from './loadDevelopmentFixture';

function createRepository(existingHymns: object[]): HymnRepository {
  return {
    getAllHymns: jest.fn().mockResolvedValue(existingHymns),
    getHymnById: jest.fn(),
    getHymnByNumber: jest.fn(),
    getHymnsByCategory: jest.fn(),
    getCategories: jest.fn(),
    replaceCatalogue: jest.fn().mockResolvedValue(undefined),
  };
}

describe('loadDevelopmentFixtureIfEmpty', () => {
  it('loads the fixture into an empty database', async () => {
    const repository = createRepository([]);

    await loadDevelopmentFixtureIfEmpty(repository);

    expect(repository.replaceCatalogue).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.arrayContaining([expect.objectContaining({ id: 'sample-praise' })]),
        hymns: expect.arrayContaining([expect.objectContaining({ id: 'sample-hymn-101' })]),
      }),
    );
  });

  it('does not overwrite an existing populated database', async () => {
    const repository = createRepository([{ id: 'existing-hymn' }]);

    await loadDevelopmentFixtureIfEmpty(repository);

    expect(repository.replaceCatalogue).not.toHaveBeenCalled();
  });
});
