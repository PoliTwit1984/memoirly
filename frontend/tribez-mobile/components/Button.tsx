import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, BorderRadius } from '../constants/Theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export function Button({
  onPress,
  title,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
}: ButtonProps) {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: Colors.surface,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary,
        };
      default:
        return {
          backgroundColor: Colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          minHeight: 54,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          minHeight: 48,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return Colors.text.primary;
      case 'outline':
        return Colors.primary;
      default:
        return Colors.background;
    }
  };

  const buttonStyles = [
    styles.button,
    getVariantStyles(),
    getSizeStyles(),
    disabled && styles.disabled,
    Platform.OS === 'web' && styles.webButton,
    style,
  ];

  const textStyles = [
    styles.text,
    { color: getTextColor() },
    size === 'small' && { fontSize: Typography.sizes.sm },
    size === 'large' && { fontSize: Typography.sizes.lg },
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.background : Colors.primary}
          size="small"
        />
      ) : (
        <Text style={textStyles}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const baseButtonStyles: ViewStyle = {
  borderRadius: BorderRadius.md,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
};

const baseTextStyles: TextStyle = {
  fontSize: Typography.sizes.md,
  fontWeight: '600',
  textAlign: 'center',
};

const webButtonStyles: ViewStyle = Platform.select({
  web: {
    cursor: 'pointer' as const,
  },
  default: {},
});

const styles = StyleSheet.create({
  button: baseButtonStyles,
  text: baseTextStyles,
  disabled: {
    opacity: 0.6,
  },
  webButton: webButtonStyles,
});
