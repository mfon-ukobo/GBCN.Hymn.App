export interface StoredFavourites {
  schemaVersion: 1;
  hymnIds: string[];
}

export const FAVOURITES_SCHEMA_VERSION = 1;

export const FAVOURITES_STORAGE_KEY = 'gbcn:favourites:v1';

export function isFavouriteHymnIds(value: unknown): value is string[] {
  if (!Array.isArray(value)) {
    return false;
  }

  const uniqueIds = new Set<string>();
  for (const hymnId of value) {
    if (typeof hymnId !== 'string' || hymnId.trim().length === 0 || uniqueIds.has(hymnId)) {
      return false;
    }
    uniqueIds.add(hymnId);
  }

  return true;
}

export function resolveStoredFavourites(value: unknown): string[] {
  if (
    !isRecord(value) ||
    value.schemaVersion !== FAVOURITES_SCHEMA_VERSION ||
    !Array.isArray(value.hymnIds)
  ) {
    return [];
  }

  return [
    ...new Set(
      value.hymnIds.filter(
        (hymnId): hymnId is string => typeof hymnId === 'string' && hymnId.trim().length > 0,
      ),
    ),
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
