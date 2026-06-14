export type ThemeMode = 'light' | 'dark';

export type HymnTextSize = 'small' | 'medium' | 'large';

export interface UserPreferences {
  themeMode: ThemeMode;
  hymnTextSize: HymnTextSize;
}

export interface StoredUserPreferences {
  schemaVersion: 1;
  preferences: UserPreferences;
}

export const USER_PREFERENCES_SCHEMA_VERSION = 1;

export const USER_PREFERENCES_STORAGE_KEY = 'gbcn:user-preferences:v1';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  themeMode: 'light',
  hymnTextSize: 'medium',
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export function isHymnTextSize(value: unknown): value is HymnTextSize {
  return value === 'small' || value === 'medium' || value === 'large';
}

export function isUserPreferences(value: unknown): value is UserPreferences {
  if (!isRecord(value)) {
    return false;
  }

  return isThemeMode(value.themeMode) && isHymnTextSize(value.hymnTextSize);
}

export function resolveStoredUserPreferences(value: unknown): UserPreferences {
  if (
    !isRecord(value) ||
    value.schemaVersion !== USER_PREFERENCES_SCHEMA_VERSION ||
    !isRecord(value.preferences)
  ) {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  return {
    themeMode: isThemeMode(value.preferences.themeMode)
      ? value.preferences.themeMode
      : DEFAULT_USER_PREFERENCES.themeMode,
    hymnTextSize: isHymnTextSize(value.preferences.hymnTextSize)
      ? value.preferences.hymnTextSize
      : DEFAULT_USER_PREFERENCES.hymnTextSize,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
