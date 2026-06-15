import type { DatabaseConnection } from '@/infrastructure/database';

import { HymnSectionType } from '../models/HymnSection';
import { SQLiteHymnRepository } from './SQLiteHymnRepository';

const hymnRow = {
  id: 'gbcn-023',
  number: 23,
  title: "JÉSÙ, BÙKÚN WA K'A TÓ LỌ",
};

const sectionRows = [
  {
    section_type: HymnSectionType.Verse,
    section_order: 1,
    section_number: 1,
    label: 'Verse 1',
    line_order: 1,
    content: 'Verse line',
  },
  {
    section_type: HymnSectionType.Refrain,
    section_order: 2,
    section_number: null,
    label: 'Refrain',
    line_order: 1,
    content: 'Refrain line',
  },
];

function createDatabase(overrides: Partial<DatabaseConnection> = {}): DatabaseConnection {
  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('SQLiteHymnRepository', () => {
  it('maps package sections and lines in order, including refrains', async () => {
    const getAllAsync = jest
      .fn()
      .mockResolvedValueOnce([{ category_id: 'future-category' }])
      .mockResolvedValueOnce(sectionRows);
    const repository = new SQLiteHymnRepository(
      createDatabase({
        getFirstAsync: jest.fn().mockResolvedValue(hymnRow),
        getAllAsync,
      }),
    );

    await expect(repository.getHymnById('gbcn-023')).resolves.toEqual({
      ...hymnRow,
      categoryIds: ['future-category'],
      sections: [
        {
          type: HymnSectionType.Verse,
          order: 1,
          number: 1,
          label: 'Verse 1',
          lines: ['Verse line'],
        },
        {
          type: HymnSectionType.Refrain,
          order: 2,
          label: 'Refrain',
          lines: ['Refrain line'],
        },
      ],
    });
    expect(getAllAsync.mock.calls[1][0]).toContain('hs.position AS section_order');
    expect(getAllAsync.mock.calls[1][0]).toContain('INNER JOIN hymn_lines');
    expect(getAllAsync.mock.calls[1][0]).toContain(
      'ORDER BY hs.position ASC, hl.position ASC',
    );
  });

  it('retrieves hymns by number and returns null for missing hymns', async () => {
    const getFirstAsync = jest
      .fn()
      .mockResolvedValueOnce(hymnRow)
      .mockResolvedValueOnce(null);
    const repository = new SQLiteHymnRepository(
      createDatabase({ getFirstAsync, getAllAsync: jest.fn().mockResolvedValue([]) }),
    );

    await expect(repository.getHymnByNumber(23)).resolves.toMatchObject({ id: 'gbcn-023' });
    await expect(repository.getHymnByNumber(999)).resolves.toBeNull();
    expect(getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE number = ?'), [23]);
  });

  it('lists and filters hymn summaries using the package category schema', async () => {
    const rows = [
      { ...hymnRow, category_id: 'future-category' },
      { id: 'gbcn-024', number: 24, title: 'Next Hymn', category_id: null },
    ];
    const getAllAsync = jest.fn().mockResolvedValue(rows);
    const repository = new SQLiteHymnRepository(createDatabase({ getAllAsync }));

    await expect(repository.getAllHymns()).resolves.toEqual([
      { ...hymnRow, categoryIds: ['future-category'] },
      { id: 'gbcn-024', number: 24, title: 'Next Hymn', categoryIds: [] },
    ]);
    await repository.getHymnsByCategory('future-category');

    expect(getAllAsync).toHaveBeenLastCalledWith(
      expect.stringContaining('SELECT hymn_id FROM hymn_categories WHERE category_id = ?'),
      ['future-category'],
    );
    expect(getAllAsync.mock.calls[0][0]).toContain('ORDER BY h.number ASC');
  });

  it('maps package category positions to sort order', async () => {
    const repository = new SQLiteHymnRepository(
      createDatabase({
        getAllAsync: jest.fn().mockResolvedValue([{ id: 'praise', name: 'Praise', sort_order: 2 }]),
      }),
    );

    await expect(repository.getCategories()).resolves.toEqual([
      { id: 'praise', name: 'Praise', sortOrder: 2 },
    ]);
  });

  it('uses an exact hymn number query for numeric searches', async () => {
    const getAllAsync = jest.fn().mockResolvedValue([{ ...hymnRow, category_id: null }]);
    const repository = new SQLiteHymnRepository(createDatabase({ getAllAsync }));

    await expect(repository.searchHymns(' 023 ')).resolves.toEqual([
      { ...hymnRow, categoryIds: [] },
    ]);
    expect(getAllAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE h.number = ?'), [23]);
  });

  it('normalizes Yoruba text and binds a safe FTS prefix query', async () => {
    const getAllAsync = jest.fn().mockResolvedValue([{ ...hymnRow, category_id: null }]);
    const repository = new SQLiteHymnRepository(createDatabase({ getAllAsync }));

    await repository.searchHymns("JÉSÙ, BÙKÚN");

    expect(getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE hymn_search MATCH ?'),
      ['jesu* bukun*', 'jesu bukun', 'jesu bukun%'],
    );
    expect(getAllAsync.mock.calls[0][0]).toContain('WHEN h.title_search = ? THEN 0');
    expect(getAllAsync.mock.calls[0][0]).not.toContain('JÉSÙ');
  });

  it('does not query FTS for an empty normalized search', async () => {
    const getAllAsync = jest.fn();
    const repository = new SQLiteHymnRepository(createDatabase({ getAllAsync }));

    await expect(repository.searchHymns("  '  ")).resolves.toEqual([]);
    expect(getAllAsync).not.toHaveBeenCalled();
  });
});
