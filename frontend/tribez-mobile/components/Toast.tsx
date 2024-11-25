import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, ZIndex } from '../constants/Theme';
import { platformShadow } from '../utils/platformStyles';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      default:
        return Colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

// Toast Manager to handle multiple toasts
type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

let toasts: ToastItem[] = [];
let listeners: ((toasts: ToastItem[]) => void)[] = [];

export const ToastManager = {
  show: (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastItem = { id, message, type };
    toasts = [...toasts, toast];
    listeners.forEach(listener => listener(toasts));
    
    setTimeout(() => {
      ToastManager.hide(id);
    }, 3000);
  },

  hide: (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id);
    listeners.forEach(listener => listener(toasts));
  },

  addListener: (listener: (toasts: ToastItem[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 40,
    left: 20,
    right: 20,
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 8,
    padding: Spacing.md,
    ...platformShadow(0.2, 4),
    zIndex: ZIndex.toast,
  },
  message: {
    color: Colors.background,
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
});

// ToastContainer component to manage multiple toasts
export function ToastContainer() {
  const [visibleToasts, setVisibleToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const removeListener = ToastManager.addListener(setVisibleToasts);
    return () => removeListener();
  }, []);

  return (
    <>
      {visibleToasts.map((toast, index) => (
        <Toast
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type}
          onHide={() => ToastManager.hide(toast.id)}
        />
      ))}
    </>
  );
}
