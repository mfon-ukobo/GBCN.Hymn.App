import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { BackHandler } from 'react-native';

import App from '@/app';
import { HymnRepositoryProvider } from '@/features/hymns';
import {
  USER_PREFERENCES_SCHEMA_VERSION,
  USER_PREFERENCES_STORAGE_KEY,
} from '@/features/preferences/domain/userPreferences';
import { darkTheme } from '@/theme';

const mockHymns = [
  { id: 'gbcn-001', number: 1, title: "ỌMỌ ỌLỌ́RUN L'ÀWA", categoryIds: [] },
  { id: 'gbcn-023', number: 23, title: "JÉSÙ, BÙKÚN WA K'A TÓ LỌ", categoryIds: [] },
];

const mockRepository = {
  getAllHymns: jest.fn().mockResolvedValue(mockHymns),
  getCategories: jest.fn().mockResolvedValue([]),
  getHymnById: jest.fn().mockImplementation(async (id: string) =>
    id === 'gbcn-023'
      ? {
          ...mockHymns[1],
          sections: [
            {
              type: 'verse',
              order: 1,
              number: 1,
              label: 'Verse 1',
              lines: ['Verse line'],
            },
            {
              type: 'refrain',
              order: 2,
              label: 'Refrain',
              lines: ['Refrain line'],
            },
          ],
        }
      : null,
  ),
  getHymnByNumber: jest.fn(),
  getHymnsByCategory: jest.fn().mockResolvedValue([]),
  searchHymns: jest.fn().mockResolvedValue([mockHymns[1]]),
};

function mockHymnStorageProvider({ children }: PropsWithChildren) {
  return <HymnRepositoryProvider repository={mockRepository}>{children}</HymnRepositoryProvider>;
}

jest.mock('@/infrastructure/database', () => ({
  HymnStorageProvider: mockHymnStorageProvider,
}));

describe('AppNavigator', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the offline hymn catalogue as the initial tab', async () => {
    await render(<App />);

    expect(await screen.findByRole('header', { name: 'Hymns' })).toBeVisible();
    expect(await screen.findByText('2 hymns available offline')).toBeVisible();
    expect(screen.getByRole('button', { name: /^Hymns, tab/ }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByRole('button', { name: /^Search, tab/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Favourites, tab/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Settings, tab/ })).toBeVisible();
    expect(screen.getAllByTestId('tab-icon-HymnsTab', { includeHiddenElements: true })).not.toHaveLength(
      0,
    );
    expect(screen.getAllByTestId('tab-icon-SearchTab', { includeHiddenElements: true })).not.toHaveLength(
      0,
    );
    expect(
      screen.getAllByTestId('tab-icon-FavouritesTab', { includeHiddenElements: true }),
    ).not.toHaveLength(0);
    expect(
      screen.getAllByTestId('tab-icon-SettingsTab', { includeHiddenElements: true }),
    ).not.toHaveLength(0);
  });

  it('applies a persisted dark theme to the hymn catalogue', async () => {
    await AsyncStorage.setItem(
      USER_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: USER_PREFERENCES_SCHEMA_VERSION,
        preferences: {
          themeMode: 'dark',
          hymnTextSize: 'medium',
        },
      }),
    );

    await render(<App />);

    expect(await screen.findByRole('header', { name: 'Hymns' })).toHaveStyle({
      color: darkTheme.colors.textPrimary,
    });
  });

  it('opens and renders an offline hymn with refrains', async () => {
    await render(<App />);

    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Hymn 23, JÉSÙ, BÙKÚN WA K'A TÓ LỌ",
      }),
    );

    expect(await screen.findByRole('header', { name: "JÉSÙ, BÙKÚN WA K'A TÓ LỌ" })).toBeVisible();
    expect(screen.getByText('Verse line')).toBeVisible();
    expect(screen.getByText('Refrain')).toBeVisible();
    expect(screen.getByText('Refrain line')).toBeVisible();
    expect(mockRepository.getHymnById).toHaveBeenCalledWith('gbcn-023');
  });

  it('persists a favourite and renders it in the Favourites tab', async () => {
    const app = await render(<App />);

    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Hymn 23, JÉSÙ, BÙKÚN WA K'A TÓ LỌ",
      }),
    );
    await fireEvent.press(await screen.findByLabelText('Add Hymn 23 to favourites'));

    expect(await screen.findByLabelText('Remove Hymn 23 from favourites')).toBeVisible();

    await act(() => {
      app.unmount();
    });
    await render(<App />);
    await fireEvent.press(await screen.findByRole('button', { name: /^Favourites, tab/ }));

    expect(await screen.findByRole('header', { name: 'Favourites' })).toBeVisible();
    expect(await screen.findByText('1 favourite hymn')).toBeVisible();
    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Hymn 23, JÉSÙ, BÙKÚN WA K'A TÓ LỌ",
      }),
    );
    await fireEvent.press(await screen.findByLabelText('Remove Hymn 23 from favourites'));

    expect(await screen.findByLabelText('Add Hymn 23 to favourites')).toBeVisible();
  });

  it('shows an empty state when there are no favourite hymns', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: /^Favourites, tab/ }));

    expect(await screen.findByText('You have no favourite hymns yet.')).toBeVisible();
    expect(screen.getByText('Open a hymn and tap the heart to save it here.')).toBeVisible();
  });

  it('searches the offline catalogue and opens a result', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: /^Search, tab/ }));
    await act(async () => {
      fireEvent.changeText(await screen.findByLabelText('Search hymns'), 'Jésù');
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    expect(
      await screen.findByRole('button', {
        name: "Hymn 23, JÉSÙ, BÙKÚN WA K'A TÓ LỌ",
      }),
    ).toBeVisible();
    expect(mockRepository.searchHymns).toHaveBeenCalledWith('Jésù');
  });

  it('shows a no-results state for unmatched offline searches', async () => {
    mockRepository.searchHymns.mockResolvedValueOnce([]);
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: /^Search, tab/ }));
    await act(async () => {
      fireEvent.changeText(await screen.findByLabelText('Search hymns'), 'not present');
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    expect(await screen.findByText('No hymns match your search.')).toBeVisible();
  });

  it('shows an honest empty state when categories are unavailable', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Categories' }));

    expect(await screen.findByText('No categories are available yet.')).toBeVisible();
    expect(
      screen.getByText(
        'The current offline hymn package does not include approved category mappings.',
      ),
    ).toBeVisible();
  });

  it('returns to the hymn list with the native stack back action', async () => {
    const addEventListener = jest.spyOn(BackHandler, 'addEventListener');

    await render(<App />);
    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Hymn 23, JÉSÙ, BÙKÚN WA K'A TÓ LỌ",
      }),
    );
    await screen.findByText('Refrain line');

    const hardwareBackPress = addEventListener.mock.calls.find(
      ([eventName]) => eventName === 'hardwareBackPress',
    )?.[1];

    expect(hardwareBackPress).toBeDefined();
    await act(() => {
      hardwareBackPress?.();
    });

    await waitFor(() => {
      expect(screen.getByRole('header', { name: 'Hymns' })).toBeVisible();
    });
  });
});
