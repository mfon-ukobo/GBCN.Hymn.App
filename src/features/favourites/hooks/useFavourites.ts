import { useContext } from 'react';

import {
  FavouritesContext,
  type FavouritesContextValue,
} from '../state/FavouritesProvider';

export function useFavourites(): FavouritesContextValue {
  const context = useContext(FavouritesContext);

  if (context === undefined) {
    throw new Error('useFavourites must be used within FavouritesProvider');
  }

  return context;
}
