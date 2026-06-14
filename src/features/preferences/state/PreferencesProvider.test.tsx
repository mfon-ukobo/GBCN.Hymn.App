import { act, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';

import type { PreferencesRepository } from '../data/preferencesRepository';
import {
  DEFAULT_USER_PREFERENCES,
  type UserPreferences,
} from '../domain/userPreferences';
import { usePreferences } from '../hooks/usePreferences';
import {
  PreferencesProvider,
  type PreferencesContextValue,
} from './PreferencesProvider';

interface ContextRef {
  current: PreferencesContextValue | null;
}

function PreferencesProbe({ contextRef }: { contextRef: ContextRef }) {
  const context = usePreferences();

  useEffect(() => {
    contextRef.current = context;
  }, [context, contextRef]);

  return (
    <Text testID="preferences-state">
      {context.preferences.themeMode}:{context.preferences.hymnTextSize}:{String(context.isHydrated)}
    </Text>
  );
}

describe('PreferencesProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts with defaults and marks hydration complete after loading', async () => {
    const load = createDeferred<UserPreferences>();
    const repository = createRepository({ load: jest.fn(() => load.promise) });

    await renderPreferences(repository);

    expect(screen.getByTestId('preferences-state')).toHaveTextContent('light:medium:false');

    await act(async () => {
      load.resolve({ themeMode: 'dark', hymnTextSize: 'large' });
      await load.promise;
    });

    expect(screen.getByTestId('preferences-state')).toHaveTextContent('dark:large:true');
  });

  it('uses defaults and completes hydration when loading rejects unexpectedly', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const repository = createRepository({
      load: jest.fn().mockRejectedValue(new Error('load failed')),
    });

    await renderPreferences(repository);

    await waitFor(() => {
      expect(screen.getByTestId('preferences-state')).toHaveTextContent('light:medium:true');
    });
  });

  it('persists complete preferences and serializes updates', async () => {
    const firstUpdate = createDeferred<UserPreferences>();
    const update = jest
      .fn()
      .mockImplementationOnce(() => firstUpdate.promise)
      .mockImplementation((preferences: UserPreferences) => Promise.resolve(preferences));
    const repository = createRepository({ update });

    const contextRef = await renderPreferences(repository);
    await waitForHydration();

    let themeUpdate!: Promise<void>;
    let textSizeUpdate!: Promise<void>;
    await act(() => {
      themeUpdate = getContext(contextRef).setThemeMode('dark');
      textSizeUpdate = getContext(contextRef).setHymnTextSize('large');
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenLastCalledWith({ themeMode: 'dark', hymnTextSize: 'medium' });
    expect(screen.getByTestId('preferences-state')).toHaveTextContent('light:medium:true');

    await act(async () => {
      firstUpdate.resolve({ themeMode: 'dark', hymnTextSize: 'medium' });
      await themeUpdate;
      await textSizeUpdate;
    });

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenLastCalledWith({ themeMode: 'dark', hymnTextSize: 'large' });
    expect(screen.getByTestId('preferences-state')).toHaveTextContent('dark:large:true');
  });

  it('preserves the last persisted state when an update fails', async () => {
    const repository = createRepository({
      update: jest.fn().mockRejectedValue(new Error('write failed')),
    });

    const contextRef = await renderPreferences(repository);
    await waitForHydration();

    await act(async () => {
      await expect(getContext(contextRef).setThemeMode('dark')).rejects.toThrow('write failed');
    });

    expect(screen.getByTestId('preferences-state')).toHaveTextContent('light:medium:true');
  });

  it('resets persisted and in-memory preferences to defaults', async () => {
    const repository = createRepository({
      load: jest.fn().mockResolvedValue({ themeMode: 'dark', hymnTextSize: 'large' }),
    });

    const contextRef = await renderPreferences(repository);
    await waitFor(() => {
      expect(screen.getByTestId('preferences-state')).toHaveTextContent('dark:large:true');
    });

    await act(async () => {
      await getContext(contextRef).resetPreferences();
    });

    expect(repository.reset).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('preferences-state')).toHaveTextContent('light:medium:true');
  });

  it('preserves the last persisted state when reset fails', async () => {
    const repository = createRepository({
      load: jest.fn().mockResolvedValue({ themeMode: 'dark', hymnTextSize: 'large' }),
      reset: jest.fn().mockRejectedValue(new Error('reset failed')),
    });

    const contextRef = await renderPreferences(repository);
    await waitFor(() => {
      expect(screen.getByTestId('preferences-state')).toHaveTextContent('dark:large:true');
    });

    await act(async () => {
      await expect(getContext(contextRef).resetPreferences()).rejects.toThrow('reset failed');
    });

    expect(screen.getByTestId('preferences-state')).toHaveTextContent('dark:large:true');
  });
});

describe('usePreferences', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when used outside PreferencesProvider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const contextRef: ContextRef = { current: null };

    await expect(render(<PreferencesProbe contextRef={contextRef} />)).rejects.toThrow(
      'usePreferences must be used within PreferencesProvider',
    );
  });
});

async function renderPreferences(repository: PreferencesRepository) {
  const contextRef: ContextRef = { current: null };

  await render(
    <PreferencesProvider repository={repository}>
      <PreferencesProbe contextRef={contextRef} />
    </PreferencesProvider>,
  );

  return contextRef;
}

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getByTestId('preferences-state')).toHaveTextContent('light:medium:true');
  });
}

function createRepository(
  overrides: Partial<PreferencesRepository> = {},
): PreferencesRepository {
  return {
    load: jest.fn().mockResolvedValue({ ...DEFAULT_USER_PREFERENCES }),
    reset: jest.fn().mockResolvedValue({ ...DEFAULT_USER_PREFERENCES }),
    update: jest.fn((preferences: UserPreferences) => Promise.resolve(preferences)),
    ...overrides,
  };
}

function getContext(contextRef: ContextRef) {
  if (contextRef.current === null) {
    throw new Error('Preference context has not rendered.');
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
