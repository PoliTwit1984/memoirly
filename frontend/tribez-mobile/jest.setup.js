import '@testing-library/jest-native/extend-expect';

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
}));

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  __esModule: true,
  default: {
    createAnimatedComponent: jest.fn((comp) => comp),
    Value: jest.fn(),
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
  },
}));

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [],
  usePathname: () => '/',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:5002',
      },
    },
  },
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  parse: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  ScrollView: 'ScrollView',
  State: {},
}));

// Mock react-native Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock useResponsive hook
jest.mock('./hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  }),
}), { virtual: true });

// Global beforeEach
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

// Global console error override
const originalError = console.error;
console.error = (...args) => {
  // Ignore specific React Native warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Please update the following components:') ||
      args[0].includes('Warning: componentWill') ||
      args[0].includes('React.createFactory()'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = jest.fn();

// Add custom matchers
expect.extend({
  toHaveStyle(received, style) {
    const pass = received.props.style.some(s => 
      Object.entries(style).every(([key, value]) => s[key] === value)
    );
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to have style ${this.utils.printExpected(style)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to have style ${this.utils.printExpected(style)}`,
        pass: false,
      };
    }
  },
});

// Set up DOM environment
global.window = {};
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
