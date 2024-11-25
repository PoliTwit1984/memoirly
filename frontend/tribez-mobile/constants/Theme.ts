import { Platform, TextStyle } from 'react-native';

export const Colors = {
  primary: '#007AFF',
  primaryDark: '#0056b3',
  background: '#ffffff',
  surface: '#f5f5f5',
  text: {
    primary: '#333333',
    secondary: '#666666',
    placeholder: '#999999',
  },
  border: '#e0e0e0',
  error: '#ff3b30',
  success: '#34c759',
  info: '#007AFF',
  warning: '#ff9500',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

type FontWeight = TextStyle['fontWeight'];

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as FontWeight,
    medium: '500' as FontWeight,
    semibold: '600' as FontWeight,
    bold: '700' as FontWeight,
  },
};

export const Shadows = Platform.select({
  web: {
    small: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    medium: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    large: {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    },
  },
  default: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
});

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

export const Animations = {
  durations: {
    short: 150,
    medium: 300,
    long: 500,
  },
  timings: {
    default: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const ZIndex = {
  modal: 1000,
  overlay: 900,
  dropdown: 800,
  header: 700,
  toast: 600,
};
