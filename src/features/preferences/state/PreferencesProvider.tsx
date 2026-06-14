import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  preferencesRepository,
  type PreferencesRepository,
} from '../data/preferencesRepository';
import {
  DEFAULT_USER_PREFERENCES,
  type HymnTextSize,
  type UserPreferences,
} from '../domain/userPreferences';
import type { ThemeMode } from '@/theme';

export interface PreferencesContextValue {
  preferences: UserPreferences;
  isHydrated: boolean;
  setThemeMode(themeMode: ThemeMode): Promise<void>;
  setHymnTextSize(hymnTextSize: HymnTextSize): Promise<void>;
  resetPreferences(): Promise<void>;
}

export const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

interface PreferencesProviderProps extends PropsWithChildren {
  repository?: PreferencesRepository;
}

export function PreferencesProvider({
  children,
  repository = preferencesRepository,
}: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_USER_PREFERENCES,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const preferencesRef = useRef(preferences);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    repository
      .load()
      .then((loadedPreferences) => {
        if (isMounted) {
          preferencesRef.current = loadedPreferences;
          setPreferences(loadedPreferences);
        }
      })
      .catch((error: unknown) => {
        if (__DEV__) {
          console.error('Preference hydration failed.', error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const enqueueWrite = useCallback(
    (write: (currentPreferences: UserPreferences) => Promise<UserPreferences>) => {
      const operation = writeQueueRef.current.then(async () => {
        const persistedPreferences = await write(preferencesRef.current);
        preferencesRef.current = persistedPreferences;
        setPreferences(persistedPreferences);
      });

      writeQueueRef.current = operation.catch(() => undefined);
      return operation;
    },
    [],
  );

  const setThemeMode = useCallback(
    (themeMode: ThemeMode) =>
      enqueueWrite((currentPreferences) =>
        repository.update({ ...currentPreferences, themeMode }),
      ),
    [enqueueWrite, repository],
  );

  const setHymnTextSize = useCallback(
    (hymnTextSize: HymnTextSize) =>
      enqueueWrite((currentPreferences) =>
        repository.update({ ...currentPreferences, hymnTextSize }),
      ),
    [enqueueWrite, repository],
  );

  const resetPreferences = useCallback(
    () => enqueueWrite(() => repository.reset()),
    [enqueueWrite, repository],
  );

  const contextValue = useMemo(
    () => ({
      preferences,
      isHydrated,
      setThemeMode,
      setHymnTextSize,
      resetPreferences,
    }),
    [isHydrated, preferences, resetPreferences, setHymnTextSize, setThemeMode],
  );

  return <PreferencesContext.Provider value={contextValue}>{children}</PreferencesContext.Provider>;
}
