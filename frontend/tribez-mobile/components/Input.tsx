import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  StyleSheet,
  Platform,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  Text,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../constants/Theme';
import { isWeb } from '../utils/platformStyles';

interface InputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({ 
  style,
  containerStyle,
  placeholderTextColor = Colors.text.placeholder,
  error,
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const inputStyle = [
    styles.input,
    {
      borderColor: error ? Colors.error : isFocused ? Colors.primary : Colors.border,
      backgroundColor: error
        ? `${Colors.error}10`
        : isFocused
        ? Colors.background
        : Colors.surface,
    },
    Platform.OS === 'web' && styles.webInput,
    style,
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        ref={ref}
        style={inputStyle}
        placeholderTextColor={placeholderTextColor}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

Input.displayName = 'Input';

const baseInputStyle: TextStyle = {
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.md,
  padding: Spacing.md,
  fontSize: Typography.sizes.md,
  color: Colors.text.primary,
  borderWidth: 1,
  borderColor: Colors.border,
  width: '100%',
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  input: {
    ...baseInputStyle,
  },
  webInput: Platform.select({
    web: {
      outlineWidth: 0,
    } as TextStyle,
    default: {} as TextStyle,
  }),
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  } as TextStyle,
});
