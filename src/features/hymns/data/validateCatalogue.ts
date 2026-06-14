import {
  HYMN_SECTION_TYPES,
  type HymnSection,
} from '../models/HymnSection';
import type { Hymn, HymnCatalogue } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';

const sectionTypes = new Set<string>(HYMN_SECTION_TYPES);

function requireNonEmptyString(value: string, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
}

function requireInteger(value: number, field: string) {
  if (!Number.isInteger(value)) {
    throw new Error(`${field} must be an integer.`);
  }
}

function requireIsoDate(value: string, field: string) {
  requireNonEmptyString(value, field);
  if (Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${field} must be an ISO date.`);
  }
}

function validateCategory(category: HymnCategory) {
  requireNonEmptyString(category.id, 'Category id');
  requireNonEmptyString(category.name, 'Category name');
  requireInteger(category.sortOrder, 'Category sortOrder');
}

function validateSection(section: HymnSection, hymnId: string) {
  requireNonEmptyString(section.id, 'Section id');
  requireNonEmptyString(section.hymnId, 'Section hymnId');
  requireNonEmptyString(section.content, 'Section content');
  requireInteger(section.sortOrder, 'Section sortOrder');

  if (section.hymnId !== hymnId) {
    throw new Error(`Section ${section.id} does not belong to hymn ${hymnId}.`);
  }
  if (!sectionTypes.has(section.sectionType)) {
    throw new Error(`Section ${section.id} has invalid sectionType "${section.sectionType}".`);
  }
  if (section.sectionNumber !== null) {
    requireInteger(section.sectionNumber, 'Section sectionNumber');
  }
}

function validateHymn(hymn: Hymn, categoryIds: Set<string>, sectionIds: Set<string>) {
  requireNonEmptyString(hymn.id, 'Hymn id');
  requireInteger(hymn.number, 'Hymn number');
  requireNonEmptyString(hymn.title, 'Hymn title');
  requireNonEmptyString(hymn.language, 'Hymn language');
  requireNonEmptyString(hymn.plainText, 'Hymn plainText');
  requireInteger(hymn.sortOrder, 'Hymn sortOrder');

  if (hymn.categoryId !== null && !categoryIds.has(hymn.categoryId)) {
    throw new Error(`Hymn ${hymn.id} references missing category ${hymn.categoryId}.`);
  }
  requireIsoDate(hymn.createdAt, `Hymn ${hymn.id} createdAt`);
  requireIsoDate(hymn.updatedAt, `Hymn ${hymn.id} updatedAt`);

  for (const section of hymn.sections) {
    validateSection(section, hymn.id);
    if (sectionIds.has(section.id)) {
      throw new Error(`Duplicate section id ${section.id}.`);
    }
    sectionIds.add(section.id);
  }
}

export function validateCatalogue(catalogue: HymnCatalogue) {
  if (!catalogue || !Array.isArray(catalogue.categories) || !Array.isArray(catalogue.hymns)) {
    throw new Error('Catalogue must contain categories and hymns.');
  }

  const categoryIds = new Set<string>();
  const categoryNames = new Set<string>();
  for (const category of catalogue.categories) {
    validateCategory(category);
    const normalisedName = category.name.trim().toLocaleLowerCase();
    if (categoryIds.has(category.id) || categoryNames.has(normalisedName)) {
      throw new Error(`Duplicate category ${category.id} or name ${category.name}.`);
    }
    categoryIds.add(category.id);
    categoryNames.add(normalisedName);
  }

  const hymnIds = new Set<string>();
  const hymnNumbers = new Set<number>();
  const sectionIds = new Set<string>();
  for (const hymn of catalogue.hymns) {
    validateHymn(hymn, categoryIds, sectionIds);
    if (hymnIds.has(hymn.id) || hymnNumbers.has(hymn.number)) {
      throw new Error(`Duplicate hymn ${hymn.id} or number ${hymn.number}.`);
    }
    hymnIds.add(hymn.id);
    hymnNumbers.add(hymn.number);
  }
}
