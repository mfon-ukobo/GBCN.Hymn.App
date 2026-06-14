import { HymnSectionType } from '../../models/HymnSection';

export function createValidCatalogueFixture() {
  return {
    categories: [
      { id: 'praise', name: 'Praise', sortOrder: 1 },
      { id: 'prayer', name: 'Prayer' },
    ],
    hymns: [
      {
        id: 'hymn-001',
        number: 1,
        title: 'Example Hymn',
        categoryIds: ['praise'],
        sections: [
          {
            type: HymnSectionType.Verse,
            order: 1,
            number: 1,
            label: 'Verse 1',
            lines: ['First verse line'],
          },
          {
            type: HymnSectionType.Chorus,
            order: 2,
            label: 'Chorus',
            lines: ['Chorus line'],
          },
        ],
      },
    ],
  };
}

function cloneFixture() {
  return structuredClone(createValidCatalogueFixture()) as {
    categories: Record<string, unknown>[];
    hymns: (Record<string, unknown> & { sections: Record<string, unknown>[] })[];
  };
}

export function createInvalidCatalogueFixtures(): Record<string, unknown> {
  const missingHymnId = cloneFixture();
  delete missingHymnId.hymns[0].id;

  const missingHymnNumber = cloneFixture();
  delete missingHymnNumber.hymns[0].number;

  const duplicateHymnNumber = cloneFixture();
  duplicateHymnNumber.hymns.push({
    ...structuredClone(duplicateHymnNumber.hymns[0]),
    id: 'hymn-002',
  });

  const invalidHymnNumber = cloneFixture();
  invalidHymnNumber.hymns[0].number = 0;

  const emptyHymnTitle = cloneFixture();
  emptyHymnTitle.hymns[0].title = '   ';

  const emptySections = cloneFixture();
  emptySections.hymns[0].sections = [];

  const unsupportedSectionType = cloneFixture();
  unsupportedSectionType.hymns[0].sections[0].type = 'refrain';

  const emptySectionLines = cloneFixture();
  emptySectionLines.hymns[0].sections[0].lines = ['  ', ''];

  const duplicateSectionOrder = cloneFixture();
  duplicateSectionOrder.hymns[0].sections[1].order = 1;

  const invalidCategoryReference = cloneFixture();
  invalidCategoryReference.hymns[0].categoryIds = ['missing'];

  const verseWithoutNumber = cloneFixture();
  delete verseWithoutNumber.hymns[0].sections[0].number;

  const unexpectedField = cloneFixture();
  unexpectedField.hymns[0].language = 'en';

  return {
    missingHymnId,
    missingHymnNumber,
    duplicateHymnNumber,
    invalidHymnNumber,
    emptyHymnTitle,
    emptySections,
    unsupportedSectionType,
    emptySectionLines,
    duplicateSectionOrder,
    invalidCategoryReference,
    verseWithoutNumber,
    unexpectedField,
  };
}
