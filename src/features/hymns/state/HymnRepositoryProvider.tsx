import { createContext, type PropsWithChildren, useContext } from 'react';

import type { HymnRepository } from '../data/HymnRepository';

const HymnRepositoryContext = createContext<HymnRepository | undefined>(undefined);

interface HymnRepositoryProviderProps extends PropsWithChildren {
  repository: HymnRepository;
}

export function HymnRepositoryProvider({
  children,
  repository,
}: HymnRepositoryProviderProps) {
  return (
    <HymnRepositoryContext.Provider value={repository}>
      {children}
    </HymnRepositoryContext.Provider>
  );
}

export function useHymnRepository(): HymnRepository {
  const repository = useContext(HymnRepositoryContext);
  if (!repository) {
    throw new Error('useHymnRepository must be used within HymnRepositoryProvider.');
  }
  return repository;
}
