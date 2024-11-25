import { Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;
type PlatformOSType = typeof Platform.OS;

export const isWeb = () => Platform.OS === 'web';

interface WebStyle extends ViewStyle {
  cursor?: string;
  transition?: string;
  outline?: string;
  outlineStyle?: string;
  outlineWidth?: number;
  userSelect?: string;
}

export const platformShadow = (
  opacity: number = 0.2,
  height: number = 2,
  radius: number = 2,
  elevation: number = 2
): ViewStyle => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height,
      },
      shadowOpacity: opacity,
      shadowRadius: radius,
    };
  }

  if (Platform.OS === 'android') {
    return {
      elevation,
    };
  }

  // Web shadow
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height,
    },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
};

type PlatformStyles<T> = {
  ios?: Partial<T>;
  android?: Partial<T>;
  web?: Partial<WebStyle>;
  default?: Partial<T>;
};

export const createPlatformStyle = <T extends Style>(
  baseStyle: T,
  platformStyles: PlatformStyles<T>
): T => {
  const platformStyle = (() => {
    switch (Platform.OS) {
      case 'ios':
        return platformStyles.ios;
      case 'android':
        return platformStyles.android;
      case 'web':
        return platformStyles.web;
      default:
        return platformStyles.default;
    }
  })();

  return {
    ...baseStyle,
    ...(platformStyle || {}),
  } as T;
};

export const webOnlyStyle = <T extends Style>(style: Partial<WebStyle>): Partial<T> => {
  if (Platform.OS === 'web') {
    return style as Partial<T>;
  }
  return {};
};

export const nativeOnlyStyle = <T extends Style>(style: Partial<T>): Partial<T> => {
  if (Platform.OS !== 'web') {
    return style;
  }
  return {};
};

export const conditionalStyle = <T extends Style>(
  condition: boolean,
  style: Partial<T>
): Partial<T> => {
  return condition ? style : {};
};
