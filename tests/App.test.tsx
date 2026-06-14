import { render, screen } from '@testing-library/react-native';

import App from '@/app';

jest.mock('react-native-safe-area-context', () =>
  jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);

describe('App', () => {
  it('renders the application title', async () => {
    await render(<App />);

    expect(screen.getByRole('header', { name: 'GBCN Hymn App' })).toBeTruthy();
  });
});
