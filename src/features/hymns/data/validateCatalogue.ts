import type { Hymn, HymnCatalogue } from '../models/Hymn';
import type { HymnCategory } from '../models/HymnCategory';
import { HymnSectionType, type HymnSection } from '../models/HymnSection';

type UnknownRecord = Record<string, unknown>;

const SECTION_TYPES = new Set<string>(Object.values(HymnSectionType));

function fail(path: string, message: string): never {
  throw new Error(`${path} ${message}`);
}

function requireRecord(value: unknown, path: string): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'must be an object.');
  }
  return value as UnknownRecord;
}

function rejectUnexpectedFields(
  record: UnknownRecord,
  path: string,
  requiredFields: readonly string[],
  optionalFields: readonly string[] = [],
) {
  const allowedFields = new Set([...requiredFields, ...optionalFields]);
  for (const field of Object.keys(record)) {
    if (!allowedFields.has(field)) {
      fail(`${path}.${field}`, 'is not allowed.');
    }
  }
}

function requireArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    fail(path, 'must be an array.');
  }
  return value;
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    fail(path, 'must be a string.');
  }
  return value;
}

function requireTrimmedIdentifier(value: unknown, path: string): string {
  const identifier = requireString(value, path);
  if (identifier.length === 0 || identifier !== identifier.trim()) {
    fail(path, 'must be a non-empty string without surrounding whitespace.');
  }
  return identifier;
}

function requireTrimmedNonEmptyString(value: unknown, path: string): string {
  const normalized = requireString(value, path).trim();
  if (normalized.length === 0) {
    fail(path, 'must be a non-empty string.');
  }
  return normalized;
}

function requirePositiveInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || (value as number) <= 0) {
    fail(path, 'must be a positive integer.');
  }
  return value as number;
}

function requireFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'must be a finite number.');
  }
  return value;
}

function isWhitespaceOnlyLine(value: unknown): value is string {
  return typeof value === 'string' && value.trim() === '';
}

function validateSection(value: unknown, path: string): HymnSection {
  const section = requireRecord(value, path);
  rejectUnexpectedFields(section, path, ['type', 'order', 'lines'], ['number', 'label']);

  if (typeof section.type !== 'string' || !SECTION_TYPES.has(section.type)) {
    fail(`${path}.type`, 'must be "verse" or "chorus".');
  }
  const type = section.type as HymnSectionType;
  const order = requirePositiveInteger(section.order, `${path}.order`);

  let number: number | undefined;
  if (Object.hasOwn(section, 'number')) {
    number = requirePositiveInteger(section.number, `${path}.number`);
  } else if (type === HymnSectionType.Verse) {
    fail(`${path}.number`, 'is required for verse sections.');
  }

  let label: string | undefined;
  if (Object.hasOwn(section, 'label')) {
    label = requireString(section.label, `${path}.label`);
  }

  const inputLines = requireArray(section.lines, `${path}.lines`);
  let firstLine = 0;
  let lastLine = inputLines.length;
  while (firstLine < lastLine && isWhitespaceOnlyLine(inputLines[firstLine])) {
    firstLine += 1;
  }
  while (lastLine > firstLine && isWhitespaceOnlyLine(inputLines[lastLine - 1])) {
    lastLine -= 1;
  }

  const lines = inputLines.slice(firstLine, lastLine).map((line, index) =>
    requireString(line, `${path}.lines[${firstLine + index}]`),
  );
  if (!lines.some((line) => line.trim().length > 0)) {
    fail(`${path}.lines`, 'must contain at least one non-empty lyric line.');
  }

  return {
    type,
    order,
    ...(number === undefined ? {} : { number }),
    ...(label === undefined ? {} : { label }),
    lines,
  };
}

function validateHymnCategoryAtPath(value: unknown, path: string): HymnCategory {
  const category = requireRecord(value, path);
  rejectUnexpectedFields(category, path, ['id', 'name'], ['sortOrder']);

  const sortOrder = Object.hasOwn(category, 'sortOrder')
    ? requireFiniteNumber(category.sortOrder, `${path}.sortOrder`)
    : undefined;

  return {
    id: requireTrimmedIdentifier(category.id, `${path}.id`),
    name: requireTrimmedNonEmptyString(category.name, `${path}.name`),
    ...(sortOrder === undefined ? {} : { sortOrder }),
  };
}

export function validateHymnCategory(value: unknown): HymnCategory {
  return validateHymnCategoryAtPath(value, 'category');
}

function validateHymnAtPath(
  value: unknown,
  knownCategoryIds: ReadonlySet<string>,
  path: string,
): Hymn {
  const hymn = requireRecord(value, path);
  rejectUnexpectedFields(hymn, path, ['id', 'number', 'title', 'categoryIds', 'sections']);

  const categoryIds = requireArray(hymn.categoryIds, `${path}.categoryIds`).map((categoryId, index) =>
    requireTrimmedIdentifier(categoryId, `${path}.categoryIds[${index}]`),
  );
  const seenCategoryIds = new Set<string>();
  for (let index = 0; index < categoryIds.length; index += 1) {
    const categoryId = categoryIds[index];
    if (seenCategoryIds.has(categoryId)) {
      fail(`${path}.categoryIds[${index}]`, `duplicates category "${categoryId}".`);
    }
    if (!knownCategoryIds.has(categoryId)) {
      fail(`${path}.categoryIds[${index}]`, `references unknown category "${categoryId}".`);
    }
    seenCategoryIds.add(categoryId);
  }

  const inputSections = requireArray(hymn.sections, `${path}.sections`);
  if (inputSections.length === 0) {
    fail(`${path}.sections`, 'must contain at least one section.');
  }

  const seenOrders = new Set<number>();
  const sections = inputSections.map((section, index) => {
    const normalizedSection = validateSection(section, `${path}.sections[${index}]`);
    if (seenOrders.has(normalizedSection.order)) {
      fail(`${path}.sections[${index}].order`, `duplicates order ${normalizedSection.order}.`);
    }
    seenOrders.add(normalizedSection.order);
    return normalizedSection;
  });
  sections.sort((left, right) => left.order - right.order);

  return {
    id: requireTrimmedIdentifier(hymn.id, `${path}.id`),
    number: requirePositiveInteger(hymn.number, `${path}.number`),
    title: requireTrimmedNonEmptyString(hymn.title, `${path}.title`),
    categoryIds,
    sections,
  };
}

export function validateHymn(value: unknown, knownCategoryIds: ReadonlySet<string>): Hymn {
  return validateHymnAtPath(value, knownCategoryIds, 'hymn');
}

export function validateCatalogue(value: unknown): HymnCatalogue {
  const catalogue = requireRecord(value, 'catalogue');
  rejectUnexpectedFields(catalogue, 'catalogue', ['categories', 'hymns']);

  const categoryIds = new Set<string>();
  const categories = requireArray(catalogue.categories, 'catalogue.categories').map((category, index) => {
    const normalizedCategory = validateHymnCategoryAtPath(category, `catalogue.categories[${index}]`);
    if (categoryIds.has(normalizedCategory.id)) {
      fail(`catalogue.categories[${index}].id`, `duplicates category id "${normalizedCategory.id}".`);
    }
    categoryIds.add(normalizedCategory.id);
    return normalizedCategory;
  });

  const hymnIds = new Set<string>();
  const hymnNumbers = new Set<number>();
  const hymns = requireArray(catalogue.hymns, 'catalogue.hymns').map((hymn, index) => {
    const normalizedHymn = validateHymnAtPath(hymn, categoryIds, `catalogue.hymns[${index}]`);
    if (hymnIds.has(normalizedHymn.id)) {
      fail(`catalogue.hymns[${index}].id`, `duplicates hymn id "${normalizedHymn.id}".`);
    }
    if (hymnNumbers.has(normalizedHymn.number)) {
      fail(`catalogue.hymns[${index}].number`, `duplicates hymn number ${normalizedHymn.number}.`);
    }
    hymnIds.add(normalizedHymn.id);
    hymnNumbers.add(normalizedHymn.number);
    return normalizedHymn;
  });

  return { categories, hymns };
}
