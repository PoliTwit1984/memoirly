import { Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;
type PlatformStyles<T extends Style> = {
  ios?: Partial<T>;
  android?: Partial<T>;
  web?: Partial<T>;
  default?: Partial<T>;
};

export function getPlatformStyles<T extends Style>(styles: PlatformStyles<T>): Partial<T> {
  const platformKey = Platform.OS;
  const platformSpecificStyles = styles[platformKey as keyof PlatformStyles<T>] || {};
  const defaultStyles = styles.default || {};

  return {
    ...defaultStyles,
    ...platformSpecificStyles,
  };
}

export function createPlatformStyle<T extends Style>(
  baseStyle: T,
  platformSpecific: PlatformStyles<T> = {}
): T {
  return {
    ...baseStyle,
    ...getPlatformStyles(platformSpecific),
  } as T;
}

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

export function isNative(): boolean {
  return Platform.OS !== 'web';
}

export const webShadow = (opacity: number = 0.1, y: number = 2, blur: number = 8): ViewStyle => 
  isWeb() ? {
    boxShadow: `0 ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`,
  } : {};

export const nativeShadow = (opacity: number = 0.1, elevation: number = 4): ViewStyle =>
  isNative() ? {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: opacity,
    shadowRadius: elevation,
    elevation,
  } : {};

export const platformShadow = (
  opacity: number = 0.1,
  elevation: number = 4,
  webY: number = 2,
  webBlur: number = 8
): ViewStyle => ({
  ...webShadow(opacity, webY, webBlur),
  ...nativeShadow(opacity, elevation),
});

export const platformSelect = <T>(options: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T => {
  const platform = Platform.OS;
  return options[platform as keyof typeof options] || options.default;
};
