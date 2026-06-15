import { act, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';

import type { FavouritesRepository } from '../data/favouritesRepository';
import { useFavourites } from '../hooks/useFavourites';
import {
  FavouritesProvider,
  type FavouritesContextValue,
} from './FavouritesProvider';

interface ContextRef {
  current: FavouritesContextValue | null;
}

function FavouritesProbe({ contextRef }: { contextRef: ContextRef }) {
  const context = useFavourites();

  useEffect(() => {
    contextRef.current = context;
  }, [context, contextRef]);

  return (
    <Text testID="favourites-state">
      {context.favouriteHymnIds.join(',')}:{String(context.isHydrated)}
    </Text>
  );
}

describe('FavouritesProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hydrates stored favourites', async () => {
    const repository = createRepository({
      load: jest.fn().mockResolvedValue(['gbcn-023']),
    });

    await renderFavourites(repository);

    await waitFor(() => {
      expect(screen.getByTestId('favourites-state')).toHaveTextContent('gbcn-023:true');
    });
  });

  it('adds and removes a favourite', async () => {
    const repository = createRepository();
    const contextRef = await renderFavourites(repository);
    await waitForHydration();

    await act(async () => {
      await expect(getContext(contextRef).toggleFavourite('gbcn-023')).resolves.toBe(true);
    });

    expect(repository.update).toHaveBeenLastCalledWith(['gbcn-023']);
    expect(getContext(contextRef).isFavourite('gbcn-023')).toBe(true);

    await act(async () => {
      await expect(getContext(contextRef).toggleFavourite('gbcn-023')).resolves.toBe(false);
    });

    expect(repository.update).toHaveBeenLastCalledWith([]);
    expect(getContext(contextRef).isFavourite('gbcn-023')).toBe(false);
  });

  it('serializes toggles so rapid updates do not overwrite each other', async () => {
    const firstUpdate = createDeferred<string[]>();
    const update = jest
      .fn()
      .mockImplementationOnce(() => firstUpdate.promise)
      .mockImplementation((hymnIds: string[]) => Promise.resolve(hymnIds));
    const repository = createRepository({ update });
    const contextRef = await renderFavourites(repository);
    await waitForHydration();

    let firstToggle!: Promise<boolean>;
    let secondToggle!: Promise<boolean>;
    await act(() => {
      firstToggle = getContext(contextRef).toggleFavourite('gbcn-023');
      secondToggle = getContext(contextRef).toggleFavourite('gbcn-001');
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenLastCalledWith(['gbcn-023']);

    await act(async () => {
      firstUpdate.resolve(['gbcn-023']);
      await firstToggle;
      await secondToggle;
    });

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenLastCalledWith(['gbcn-023', 'gbcn-001']);
    expect(screen.getByTestId('favourites-state')).toHaveTextContent(
      'gbcn-023,gbcn-001:true',
    );
  });

  it('preserves persisted state when an update fails', async () => {
    const repository = createRepository({
      load: jest.fn().mockResolvedValue(['gbcn-023']),
      update: jest.fn().mockRejectedValue(new Error('write failed')),
    });
    const contextRef = await renderFavourites(repository);
    await waitFor(() => {
      expect(screen.getByTestId('favourites-state')).toHaveTextContent('gbcn-023:true');
    });

    await act(async () => {
      await expect(getContext(contextRef).toggleFavourite('gbcn-001')).rejects.toThrow(
        'write failed',
      );
    });

    expect(screen.getByTestId('favourites-state')).toHaveTextContent('gbcn-023:true');
  });
});

describe('useFavourites', () => {
  it('throws when used outside FavouritesProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const contextRef: ContextRef = { current: null };

    await expect(render(<FavouritesProbe contextRef={contextRef} />)).rejects.toThrow(
      'useFavourites must be used within FavouritesProvider',
    );
  });
});

async function renderFavourites(repository: FavouritesRepository) {
  const contextRef: ContextRef = { current: null };

  await render(
    <FavouritesProvider repository={repository}>
      <FavouritesProbe contextRef={contextRef} />
    </FavouritesProvider>,
  );

  return contextRef;
}

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getByTestId('favourites-state')).toHaveTextContent(':true');
  });
}

function createRepository(
  overrides: Partial<FavouritesRepository> = {},
): FavouritesRepository {
  return {
    load: jest.fn().mockResolvedValue([]),
    update: jest.fn((hymnIds: string[]) => Promise.resolve(hymnIds)),
    ...overrides,
  };
}

function getContext(contextRef: ContextRef) {
  if (contextRef.current === null) {
    throw new Error('Favourite context has not rendered.');
  }

  return contextRef.current;
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}
