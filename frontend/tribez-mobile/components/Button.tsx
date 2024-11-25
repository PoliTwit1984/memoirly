import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  Pressable,
  PressableStateCallbackType,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Theme';
import { platformShadow, createPlatformStyle } from '../utils/platformStyles';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) {
      return Colors.border;
    }

    switch (variant) {
      case 'secondary':
        return pressed ? `${Colors.primary}10` : Colors.background;
      case 'outline':
        return pressed ? `${Colors.primary}10` : 'transparent';
      default:
        return pressed ? Colors.primaryDark : Colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) {
      return Colors.border;
    }

    switch (variant) {
      case 'secondary':
        return Colors.border;
      case 'outline':
        return Colors.primary;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return Colors.text.secondary;
    }

    switch (variant) {
      case 'secondary':
      case 'outline':
        return Colors.primary;
      default:
        return Colors.background;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
        };
      case 'large':
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
        };
      default:
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
        };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: Typography.sizes.sm };
      case 'large':
        return { fontSize: Typography.sizes.lg };
      default:
        return { fontSize: Typography.sizes.md };
    }
  };

  const renderContent = (pressed: boolean) => (
    <>
      {loading ? (
        <ActivityIndicator
          testID="activity-indicator"
          color={variant === 'primary' ? Colors.background : Colors.primary}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextSize(),
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  const buttonStyle = createPlatformStyle<ViewStyle>(
    {
      ...styles.button,
      ...getSizeStyles(),
    },
    {
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        outlineWidth: 0,
      },
    }
  );

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          buttonStyle,
          {
            backgroundColor: getBackgroundColor(false),
            borderColor: getBorderColor(),
          },
          style,
        ]}
        activeOpacity={0.7}
      >
        {renderContent(false)}
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={(state: PressableStateCallbackType) => [
        buttonStyle,
        {
          backgroundColor: getBackgroundColor(state.pressed),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {(state: PressableStateCallbackType) => renderContent(state.pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginVertical: Spacing.xs,
    width: '100%',
    ...platformShadow(0.1, 2),
  },
  text: {
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
