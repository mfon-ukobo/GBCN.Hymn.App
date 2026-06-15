import { createFtsPrefixQuery, normalizeSearchQuery } from './normalizeSearchQuery';

describe('hymn search normalization', () => {
  it('normalizes Yoruba diacritics and punctuation', () => {
    expect(normalizeSearchQuery(" 'TẸ̀ JÈHÓFÀ! ")).toBe('te jehofa');
  });

  it('creates bound-safe FTS prefix terms', () => {
    expect(createFtsPrefixQuery("JÉSÙ, BÙKÚN")).toBe('jesu* bukun*');
    expect(createFtsPrefixQuery("Jésù' OR *")).toBe('jesu* or*');
  });
});
