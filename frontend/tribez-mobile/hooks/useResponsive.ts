import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

type Breakpoint = keyof typeof BREAKPOINTS;

interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  breakpoint: Breakpoint;
}

export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    function handleDimensionsChange({ window }: { window: ScaledSize }) {
      setDimensions(window);
    }

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      // Remove listener on cleanup
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  const { width, height } = dimensions;

  const getBreakpoint = (w: number): Breakpoint => {
    if (w >= BREAKPOINTS.desktop) return 'desktop';
    if (w >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  };

  const breakpoint = getBreakpoint(width);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    width,
    height,
    breakpoint,
  };
}

// Helper function to get responsive value based on breakpoint
export function getResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}, currentBreakpoint: Breakpoint): T {
  if (values[currentBreakpoint]) {
    return values[currentBreakpoint] as T;
  }
  return values.default;
}

// Helper function to create responsive styles
export function createResponsiveStyle<T extends object>(
  baseStyle: T,
  responsiveStyles: {
    tablet?: Partial<T>;
    desktop?: Partial<T>;
  } = {}
): T {
  const { breakpoint } = useResponsive();
  
  if (Platform.OS !== 'web') {
    return baseStyle;
  }

  let finalStyle = { ...baseStyle };

  if (breakpoint === 'tablet' && responsiveStyles.tablet) {
    finalStyle = { ...finalStyle, ...responsiveStyles.tablet };
  }

  if (breakpoint === 'desktop' && responsiveStyles.desktop) {
    finalStyle = { ...finalStyle, ...responsiveStyles.desktop };
  }

  return finalStyle;
}
