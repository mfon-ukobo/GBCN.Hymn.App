import { HymnSectionType } from '../models/HymnSection';
import sampleCatalogue from '../../../../assets/data/hymns.sample.json';
import {
  createInvalidCatalogueFixtures,
  createValidCatalogueFixture,
} from './__fixtures__/hymnFixtures';
import { validateCatalogue, validateHymn, validateHymnCategory } from './validateCatalogue';

describe('hymn validation', () => {
  it('validates the canonical hymn catalogue', () => {
    expect(validateCatalogue(createValidCatalogueFixture())).toEqual(createValidCatalogueFixture());
  });

  it('validates the development sample catalogue', () => {
    expect(validateCatalogue(sampleCatalogue)).toMatchObject({
      categories: expect.arrayContaining([expect.objectContaining({ id: 'sample-praise' })]),
      hymns: expect.arrayContaining([expect.objectContaining({ id: 'sample-hymn-101' })]),
    });
  });

  it('validates a hymn with no categories', () => {
    const catalogue = createValidCatalogueFixture();
    catalogue.hymns[0].categoryIds = [];

    expect(validateCatalogue(catalogue).hymns[0].categoryIds).toEqual([]);
  });

  it('validates a hymn with multiple categories', () => {
    const catalogue = createValidCatalogueFixture();
    catalogue.hymns[0].categoryIds = ['praise', 'prayer'];

    expect(validateCatalogue(catalogue).hymns[0].categoryIds).toEqual(['praise', 'prayer']);
  });

  it('normalizes category names, hymn titles, section order, and boundary lyric lines', () => {
    const catalogue = createValidCatalogueFixture();
    catalogue.categories[0].name = '  Praise  ';
    catalogue.hymns[0].title = '  Example Hymn  ';
    catalogue.hymns[0].sections.reverse();
    catalogue.hymns[0].sections[0].lines = ['', '  ', 'Chorus line', ''];

    const validated = validateCatalogue(catalogue);

    expect(validated.categories[0].name).toBe('Praise');
    expect(validated.hymns[0].title).toBe('Example Hymn');
    expect(validated.hymns[0].sections.map((section) => section.order)).toEqual([1, 2]);
    expect(validated.hymns[0].sections[1].lines).toEqual(['Chorus line']);
  });

  it('validates standalone category and hymn records', () => {
    expect(validateHymnCategory({ id: 'praise', name: ' Praise ' })).toEqual({
      id: 'praise',
      name: 'Praise',
    });
    expect(
      validateHymn(createValidCatalogueFixture().hymns[0], new Set(['praise', 'prayer'])),
    ).toMatchObject({ id: 'hymn-001', number: 1 });
  });

  it.each([
    ['missingHymnId', 'catalogue.hymns[0].id'],
    ['missingHymnNumber', 'catalogue.hymns[0].number'],
    ['duplicateHymnNumber', 'catalogue.hymns[1].number'],
    ['invalidHymnNumber', 'catalogue.hymns[0].number'],
    ['emptyHymnTitle', 'catalogue.hymns[0].title'],
    ['emptySections', 'catalogue.hymns[0].sections'],
    ['unsupportedSectionType', 'catalogue.hymns[0].sections[0].type'],
    ['emptySectionLines', 'catalogue.hymns[0].sections[0].lines'],
    ['duplicateSectionOrder', 'catalogue.hymns[0].sections[1].order'],
    ['invalidCategoryReference', 'catalogue.hymns[0].categoryIds[0]'],
    ['verseWithoutNumber', 'catalogue.hymns[0].sections[0].number'],
    ['unexpectedField', 'catalogue.hymns[0].language'],
  ])('rejects the %s fixture with a field-path error', (fixtureName, expectedPath) => {
    const fixture = createInvalidCatalogueFixtures()[fixtureName];

    expect(() => validateCatalogue(fixture)).toThrow(expectedPath);
  });

  it('rejects duplicate category ids within a hymn', () => {
    const catalogue = createValidCatalogueFixture();
    catalogue.hymns[0].categoryIds = ['praise', 'praise'];

    expect(() => validateCatalogue(catalogue)).toThrow('catalogue.hymns[0].categoryIds[1]');
  });

  it('rejects duplicate catalogue identifiers and invalid category names', () => {
    const duplicateHymnId = createValidCatalogueFixture();
    duplicateHymnId.hymns.push(structuredClone(duplicateHymnId.hymns[0]));
    duplicateHymnId.hymns[1].number = 2;
    expect(() => validateCatalogue(duplicateHymnId)).toThrow('catalogue.hymns[1].id');

    const duplicateCategoryId = createValidCatalogueFixture();
    duplicateCategoryId.categories[1].id = 'praise';
    expect(() => validateCatalogue(duplicateCategoryId)).toThrow('catalogue.categories[1].id');

    expect(() => validateHymnCategory({ id: 'praise', name: '  ' })).toThrow('category.name');
  });

  it.each([0, -1, 1.5])('rejects invalid hymn number %s', (number) => {
    const catalogue = createValidCatalogueFixture();
    catalogue.hymns[0].number = number;

    expect(() => validateCatalogue(catalogue)).toThrow('catalogue.hymns[0].number');
  });

  it('rejects invalid optional chorus numbers', () => {
    const catalogue = createValidCatalogueFixture();
    catalogue.hymns[0].sections[1].number = 0;

    expect(() => validateCatalogue(catalogue)).toThrow('catalogue.hymns[0].sections[1].number');
  });

  it('uses only enum-backed section types', () => {
    expect(HymnSectionType).toEqual({ Verse: 'verse', Chorus: 'chorus' });
  });
});
