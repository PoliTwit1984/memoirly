import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/Theme';
import { platformShadow } from '../utils/platformStyles';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator
          size={Platform.OS === 'ios' ? 'large' : 48}
          color={Colors.primary}
        />
        {message && (
          <Text style={styles.message}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}

const overlayStyle: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const contentStyle: ViewStyle = {
  backgroundColor: Colors.background,
  borderRadius: 12,
  padding: Spacing.xl,
  minWidth: 150,
  alignItems: 'center',
  ...platformShadow(0.2, 8, 4, 16),
};

const styles = StyleSheet.create({
  container: overlayStyle,
  content: contentStyle,
  message: {
    marginTop: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.sizes.md,
    textAlign: 'center',
  },
});
