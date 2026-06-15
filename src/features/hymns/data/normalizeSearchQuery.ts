export function normalizeSearchQuery(query: string): string {
  return query
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('yo-NG')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function createFtsPrefixQuery(query: string): string {
  return normalizeSearchQuery(query)
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `${token}*`)
    .join(' ');
}
