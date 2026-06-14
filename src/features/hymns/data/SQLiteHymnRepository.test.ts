import type { DatabaseConnection, DatabaseExecutor } from '@/infrastructure/database';

import type { Hymn, HymnCatalogue } from '../models/Hymn';
import { SQLiteHymnRepository } from './SQLiteHymnRepository';

const hymnRow = {
  id: 'hymn-20',
  number: 20,
  title: 'Test Hymn',
  category_id: 'category-1',
  language: 'en',
  plain_text: 'First verse Second verse',
  sort_order: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const sections = [
  {
    id: 'section-2',
    hymn_id: 'hymn-20',
    section_type: 'verse',
    section_number: 2,
    label: null,
    content: 'Second verse',
    sort_order: 2,
  },
  {
    id: 'section-1',
    hymn_id: 'hymn-20',
    section_type: 'verse',
    section_number: 1,
    label: null,
    content: 'First verse',
    sort_order: 1,
  },
] as const;

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

function createCatalogue(hymnIds = ['new-hymn-1', 'new-hymn-2']): HymnCatalogue {
  return {
    categories: [{ id: 'category-1', name: 'Category', sortOrder: 1 }],
    hymns: hymnIds.map(
      (id, index): Hymn => ({
        id,
        number: index + 1,
        title: `Hymn ${index + 1}`,
        categoryId: 'category-1',
        language: 'en',
        plainText: `Hymn ${index + 1} text`,
        sortOrder: index + 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        sections: [
          {
            id: `${id}-section`,
            hymnId: id,
            sectionType: 'verse',
            sectionNumber: 1,
            label: null,
            content: 'Verse',
            sortOrder: 1,
          },
        ],
      }),
    ),
  };
}

describe('SQLiteHymnRepository', () => {
  it('retrieves a hymn by id with sections in database order', async () => {
    const getAllAsync = jest.fn().mockResolvedValue([sections[1], sections[0]]);
    const database = createDatabase({
      getFirstAsync: jest.fn().mockResolvedValue(hymnRow),
      getAllAsync,
    });
    const repository = new SQLiteHymnRepository(database);

    const hymn = await repository.getHymnById('hymn-20');

    expect(hymn?.sections.map((section) => section.id)).toEqual(['section-1', 'section-2']);
    expect(getAllAsync).toHaveBeenCalledWith(expect.stringContaining('ORDER BY sort_order ASC'), [
      'hymn-20',
    ]);
  });

  it('retrieves a hymn by number and returns null for missing hymns', async () => {
    const getFirstAsync = jest
      .fn()
      .mockResolvedValueOnce(hymnRow)
      .mockResolvedValueOnce(null);
    const database = createDatabase({
      getFirstAsync,
      getAllAsync: jest.fn().mockResolvedValue([sections[1], sections[0]]),
    });
    const repository = new SQLiteHymnRepository(database);

    await expect(repository.getHymnByNumber(20)).resolves.toMatchObject({ id: 'hymn-20' });
    await expect(repository.getHymnByNumber(999)).resolves.toBeNull();
    expect(getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE number = ?'), [20]);
  });

  it('lists and filters hymn summaries in the requested database order', async () => {
    const getAllAsync = jest.fn().mockResolvedValue([hymnRow]);
    const repository = new SQLiteHymnRepository(createDatabase({ getAllAsync }));

    await expect(repository.getAllHymns()).resolves.toEqual([
      {
        id: 'hymn-20',
        number: 20,
        title: 'Test Hymn',
        categoryId: 'category-1',
        language: 'en',
        sortOrder: 1,
      },
    ]);
    await repository.getHymnsByCategory('category-1');

    expect(getAllAsync).toHaveBeenLastCalledWith(
      expect.stringContaining('WHERE category_id = ?'),
      ['category-1'],
    );
    expect(getAllAsync.mock.calls[0][0]).toContain('ORDER BY sort_order ASC, number ASC');
  });

  it('replaces the catalogue in one transaction', async () => {
    const database = createDatabase();
    const repository = new SQLiteHymnRepository(database);

    await repository.replaceCatalogue(createCatalogue());

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledWith('DELETE FROM hymns');
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO hymns'),
      expect.arrayContaining(['new-hymn-1']),
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
            if (source.includes('INSERT INTO hymns')) {
              const id = params?.[0] as string;
              pendingHymnIds.push(id);
              if (id === 'new-hymn-2') {
                throw new Error('insert failed');
              }
            }
            return { changes: 1, lastInsertRowId: 0 };
          }),
        } as DatabaseExecutor;

        await task(transaction);
        hymnIds = pendingHymnIds;
      },
    );
    const repository = new SQLiteHymnRepository(database);

    await expect(repository.replaceCatalogue(createCatalogue())).rejects.toThrow('insert failed');

    expect(hymnIds).toEqual(['existing-hymn']);
  });

  it('rejects invalid section types before deleting existing data', async () => {
    const catalogue = createCatalogue();
    catalogue.hymns[0].sections[0].sectionType = 'invalid' as 'verse';
    const database = createDatabase();
    const repository = new SQLiteHymnRepository(database);

    await expect(repository.replaceCatalogue(catalogue)).rejects.toThrow('invalid sectionType');

    expect(database.withTransactionAsync).not.toHaveBeenCalled();
  });
});
