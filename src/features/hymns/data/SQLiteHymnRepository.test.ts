import type { DatabaseConnection, DatabaseExecutor } from '@/infrastructure/database';

import { HymnSectionType } from '../models/HymnSection';
import { createValidCatalogueFixture } from './__fixtures__/hymnFixtures';
import { SQLiteHymnRepository } from './SQLiteHymnRepository';

const hymnRow = {
  id: 'hymn-20',
  number: 20,
  title: 'Test Hymn',
};

const categoryRows = [{ category_id: 'praise' }, { category_id: 'prayer' }];

const sectionRows = [
  {
    section_type: HymnSectionType.Verse,
    section_order: 1,
    section_number: 1,
    label: 'Verse 1',
    line_order: 1,
    content: 'First verse line',
  },
  {
    section_type: HymnSectionType.Verse,
    section_order: 1,
    section_number: 1,
    label: 'Verse 1',
    line_order: 2,
    content: 'Second verse line',
  },
  {
    section_type: HymnSectionType.Chorus,
    section_order: 2,
    section_number: null,
    label: 'Chorus',
    line_order: 1,
    content: 'Chorus line',
  },
];

function createDatabase(overrides: Partial<DatabaseConnection> = {}): DatabaseConnection {
  const database: DatabaseConnection = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
    withTransactionAsync: jest.fn(),
    ...overrides,
  };
  (database.withTransactionAsync as jest.Mock).mockImplementation(
    async (task: (transaction: DatabaseExecutor) => Promise<void>) => task(database),
  );
  return database;
}

describe('SQLiteHymnRepository', () => {
  it('retrieves a canonical hymn with ordered category, section, and lyric data', async () => {
    const getAllAsync = jest
      .fn()
      .mockResolvedValueOnce(categoryRows)
      .mockResolvedValueOnce(sectionRows);
    const database = createDatabase({
      getFirstAsync: jest.fn().mockResolvedValue(hymnRow),
      getAllAsync,
    });
    const repository = new SQLiteHymnRepository(database);

    const hymn = await repository.getHymnById('hymn-20');

    expect(hymn).toEqual({
      ...hymnRow,
      categoryIds: ['praise', 'prayer'],
      sections: [
        {
          type: HymnSectionType.Verse,
          order: 1,
          number: 1,
          label: 'Verse 1',
          lines: ['First verse line', 'Second verse line'],
        },
        {
          type: HymnSectionType.Chorus,
          order: 2,
          label: 'Chorus',
          lines: ['Chorus line'],
        },
      ],
    });
    expect(getAllAsync.mock.calls[0][0]).toContain('ORDER BY category_order ASC');
    expect(getAllAsync.mock.calls[1][0]).toContain(
      'ORDER BY hs.section_order ASC, hsl.line_order ASC',
    );
  });

  it('retrieves a hymn by number and returns null for missing hymns', async () => {
    const getFirstAsync = jest
      .fn()
      .mockResolvedValueOnce(hymnRow)
      .mockResolvedValueOnce(null);
    const database = createDatabase({
      getFirstAsync,
      getAllAsync: jest.fn().mockResolvedValue([]),
    });
    const repository = new SQLiteHymnRepository(database);

    await expect(repository.getHymnByNumber(20)).resolves.toMatchObject({ id: 'hymn-20' });
    await expect(repository.getHymnByNumber(999)).resolves.toBeNull();
    expect(getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE number = ?'), [20]);
  });

  it('lists and filters canonical hymn summaries with all category ids', async () => {
    const summaryRows = [
      { ...hymnRow, category_id: 'praise' },
      { ...hymnRow, category_id: 'prayer' },
      { id: 'hymn-21', number: 21, title: 'No Category', category_id: null },
    ];
    const getAllAsync = jest.fn().mockResolvedValue(summaryRows);
    const repository = new SQLiteHymnRepository(createDatabase({ getAllAsync }));

    await expect(repository.getAllHymns()).resolves.toEqual([
      { ...hymnRow, categoryIds: ['praise', 'prayer'] },
      { id: 'hymn-21', number: 21, title: 'No Category', categoryIds: [] },
    ]);
    await repository.getHymnsByCategory('praise');

    expect(getAllAsync).toHaveBeenLastCalledWith(
      expect.stringContaining('SELECT hymn_id FROM hymn_categories WHERE category_id = ?'),
      ['praise'],
    );
    expect(getAllAsync.mock.calls[0][0]).toContain('ORDER BY h.number ASC');
  });

  it('replaces the catalogue in one transaction using normalized canonical values', async () => {
    const database = createDatabase();
    const repository = new SQLiteHymnRepository(database);
    const catalogue = createValidCatalogueFixture();
    catalogue.hymns[0].title = ' Example Hymn ';

    await repository.replaceCatalogue(catalogue);

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledWith('DELETE FROM hymn_section_lines');
    expect(database.runAsync).toHaveBeenCalledWith(
      'INSERT INTO hymns (id, number, title) VALUES (?, ?, ?)',
      ['hymn-001', 1, 'Example Hymn'],
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO hymn_categories'),
      ['hymn-001', 'praise', 1],
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO hymn_section_lines'),
      ['hymn-001', 1, 1, 'First verse line'],
    );
  });

  it('leaves existing data unchanged when catalogue replacement fails', async () => {
    let hymnIds = ['existing-hymn'];
    const database = createDatabase();
    (database.withTransactionAsync as jest.Mock).mockImplementation(
      async (task: (transaction: DatabaseExecutor) => Promise<void>) => {
        const pendingHymnIds = [...hymnIds];
        const transaction = {
          ...database,
          runAsync: jest.fn(async (source: string, params?: unknown[]) => {
            if (source === 'DELETE FROM hymns') {
              pendingHymnIds.length = 0;
            }
            if (source.startsWith('INSERT INTO hymns')) {
              pendingHymnIds.push(params?.[0] as string);
              throw new Error('insert failed');
            }
            return { changes: 1, lastInsertRowId: 0 };
          }),
        } as DatabaseExecutor;

        await task(transaction);
        hymnIds = pendingHymnIds;
      },
    );
    const repository = new SQLiteHymnRepository(database);

    await expect(repository.replaceCatalogue(createValidCatalogueFixture())).rejects.toThrow(
      'insert failed',
    );

    expect(hymnIds).toEqual(['existing-hymn']);
  });

  it('rejects invalid section types before deleting existing data', async () => {
    const catalogue = createValidCatalogueFixture() as unknown as {
      hymns: { sections: { type: string }[] }[];
    };
    catalogue.hymns[0].sections[0].type = 'invalid';
    const database = createDatabase();
    const repository = new SQLiteHymnRepository(database);

    await expect(repository.replaceCatalogue(catalogue)).rejects.toThrow(
      'catalogue.hymns[0].sections[0].type',
    );

    expect(database.withTransactionAsync).not.toHaveBeenCalled();
  });
});
