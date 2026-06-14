jest.mock('react-native-safe-area-context', () =>
  jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
