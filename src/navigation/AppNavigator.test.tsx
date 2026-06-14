import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import App from '@/app';

jest.mock('@/infrastructure/database', () => ({
  initializeHymnStorage: jest.fn().mockResolvedValue(undefined),
}));

describe('AppNavigator', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders Hymns as the initial tab with all main tabs available', async () => {
    await render(<App />);

    expect(await screen.findByRole('header', { name: 'Hymns' })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Hymns, tab/ }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByRole('button', { name: /^Search, tab/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Favourites, tab/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Settings, tab/ })).toBeVisible();
  });

  it('switches between main tabs', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: /^Search, tab/ }));
    expect(await screen.findByRole('header', { name: 'Search' })).toBeVisible();
    expect(screen.getByRole('button', { name: /^Hymns, tab/ })).toBeVisible();

    await fireEvent.press(screen.getByRole('button', { name: /^Settings, tab/ }));
    expect(await screen.findByRole('header', { name: 'Settings' })).toBeVisible();
  });

  it('opens categories from the hymn browsing flow', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Browse categories' }));

    expect(await screen.findByRole('header', { name: 'Categories' })).toBeVisible();
  });

  it('passes a stable category identifier to category hymns', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Browse categories' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Open sample category' }));

    expect(await screen.findByRole('header', { name: 'Category Hymns' })).toBeVisible();
    expect(screen.getByTestId('category-hymns-id')).toHaveTextContent('navigation-test-category');
  });

  it('passes a stable hymn identifier to hymn detail', async () => {
    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Open sample hymn' }));

    expect(await screen.findByRole('header', { name: 'Hymn Detail' })).toBeVisible();
    expect(screen.getByTestId('hymn-detail-id')).toHaveTextContent('navigation-test-hymn');
  });

  it('returns to the previous screen with the native stack back action', async () => {
    const addEventListener = jest.spyOn(BackHandler, 'addEventListener');

    await render(<App />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Browse categories' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Open sample category' }));

    const hardwareBackPress = addEventListener.mock.calls.find(
      ([eventName]) => eventName === 'hardwareBackPress',
    )?.[1];

    expect(hardwareBackPress).toBeDefined();
    await act(() => {
      hardwareBackPress?.();
    });

    await waitFor(() => {
      expect(screen.getByRole('header', { name: 'Categories' })).toBeVisible();
    });
  });
});
