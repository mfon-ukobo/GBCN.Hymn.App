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
  favouritesRepository,
  type FavouritesRepository,
} from '../data/favouritesRepository';

export interface FavouritesContextValue {
  favouriteHymnIds: string[];
  isHydrated: boolean;
  isFavourite(hymnId: string): boolean;
  toggleFavourite(hymnId: string): Promise<boolean>;
}

export const FavouritesContext = createContext<FavouritesContextValue | undefined>(undefined);

interface FavouritesProviderProps extends PropsWithChildren {
  repository?: FavouritesRepository;
}

export function FavouritesProvider({
  children,
  repository = favouritesRepository,
}: FavouritesProviderProps) {
  const [favouriteHymnIds, setFavouriteHymnIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const favouriteHymnIdsRef = useRef(favouriteHymnIds);
  const writeQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    repository
      .load()
      .then((loadedHymnIds) => {
        if (isMounted) {
          favouriteHymnIdsRef.current = loadedHymnIds;
          setFavouriteHymnIds(loadedHymnIds);
        }
      })
      .catch((error: unknown) => {
        if (__DEV__) {
          console.error('Favourite hydration failed.', error);
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

  const isFavourite = useCallback(
    (hymnId: string) => favouriteHymnIds.includes(hymnId),
    [favouriteHymnIds],
  );

  const toggleFavourite = useCallback(
    (hymnId: string) => {
      if (hymnId.trim().length === 0) {
        return Promise.reject(new Error('A hymn ID is required.'));
      }

      const operation = writeQueueRef.current.then(async () => {
        const currentHymnIds = favouriteHymnIdsRef.current;
        const willBeFavourite = !currentHymnIds.includes(hymnId);
        const nextHymnIds = willBeFavourite
          ? [...currentHymnIds, hymnId]
          : currentHymnIds.filter((currentHymnId) => currentHymnId !== hymnId);
        const persistedHymnIds = await repository.update(nextHymnIds);

        favouriteHymnIdsRef.current = persistedHymnIds;
        setFavouriteHymnIds(persistedHymnIds);
        return willBeFavourite;
      });

      writeQueueRef.current = operation.then(
        () => undefined,
        () => undefined,
      );
      return operation;
    },
    [repository],
  );

  const contextValue = useMemo(
    () => ({
      favouriteHymnIds,
      isHydrated,
      isFavourite,
      toggleFavourite,
    }),
    [favouriteHymnIds, isFavourite, isHydrated, toggleFavourite],
  );

  return <FavouritesContext.Provider value={contextValue}>{children}</FavouritesContext.Provider>;
}
