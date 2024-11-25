import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ViewStyle,
  TextStyle,
  Animated,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register, login } from '../services/auth';
import { useResponsive } from '../hooks/useResponsive';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Colors, Typography, Spacing } from '../constants/Theme';
import { platformShadow, isWeb } from '../utils/platformStyles';
import {
  validateForm,
  showErrorAlert,
  showSuccessMessage,
  handleError,
} from '../utils/errorHandling';
import {
  useKeyboard,
  useKeyboardDismissible,
  useKeyboardListener,
  getKeyboardAvoidingViewBehavior,
  getKeyboardVerticalOffset,
} from '../utils/keyboard';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formAnimation] = useState(new Animated.Value(0));
  
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { keyboardVisible, keyboardHeight } = useKeyboard();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleKeyboardShow = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  useKeyboardListener(handleKeyboardShow);
  useKeyboardDismissible(() => {
    // Optional: Handle keyboard dismiss
  });

  React.useEffect(() => {
    Animated.spring(formAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
  };

  const focusPassword = () => {
    passwordInputRef.current?.focus();
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    handleAuth();
  };

  const handleAuth = async () => {
    clearErrors();
    const validation = validateForm(email, password);
    
    if (!validation.isValid) {
      if (validation.error?.code === 'INVALID_EMAIL') {
        setEmailError(validation.error.message);
        emailInputRef.current?.focus();
      } else if (validation.error?.code === 'WEAK_PASSWORD') {
        setPasswordError(validation.error.message);
        passwordInputRef.current?.focus();
      } else if (validation.error) {
        showErrorAlert(validation.error);
      }
      return;
    }

    try {
      setIsLoading(true);
      if (isLogin) {
        await login(email, password);
        showSuccessMessage('Welcome back!');
      } else {
        await register(email, password);
        showSuccessMessage('Account created successfully!');
      }
      router.replace('/(tabs)');
    } catch (error) {
      const handledError = handleError(error);
      showErrorAlert(handledError);
      
      if (handledError.code === 'INVALID_EMAIL') {
        emailInputRef.current?.focus();
      } else if (handledError.code === 'INVALID_CREDENTIALS') {
        passwordInputRef.current?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    Keyboard.dismiss();
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    clearErrors();
    // Delay focus to allow keyboard to dismiss
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  const formTransform = {
    transform: [
      {
        translateY: formAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
    opacity: formAnimation,
  };

  return (
    <KeyboardAvoidingView
      behavior={getKeyboardAvoidingViewBehavior()}
      keyboardVerticalOffset={getKeyboardVerticalOffset()}
      style={styles.keyboardAvoidingView}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContainer,
            keyboardVisible && styles.keyboardVisible,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.container, formTransform]}>
            <View style={[
              styles.formContainer,
              !isMobile && styles.desktopFormContainer
            ]}>
              {!keyboardVisible && (
                <Text style={[
                  styles.title,
                  !isMobile && styles.desktopTitle
                ]}>
                  Welcome to Tribez
                </Text>
              )}
              <Text style={[
                styles.subtitle,
                !isMobile && styles.desktopSubtitle,
                keyboardVisible && styles.condensedSpacing,
              ]}>
                {isLogin ? 'Login to your account' : 'Create a new account'}
              </Text>

              <Input
                ref={emailInputRef}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={emailError}
                editable={!isLoading}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={focusPassword}
                textContentType="emailAddress"
                autoCorrect={false}
              />

              <Input
                ref={passwordInputRef}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry
                autoComplete="password"
                error={passwordError}
                editable={!isLoading}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
                textContentType={isLogin ? "password" : "newPassword"}
                autoCorrect={false}
              />

              <Button
                title={isLogin ? 'Login' : 'Register'}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                size={isMobile ? 'large' : 'medium'}
              />

              <Button
                title={isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'
                }
                onPress={toggleAuthMode}
                disabled={isLoading}
                variant="secondary"
                size={isMobile ? 'medium' : 'small'}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      <LoadingOverlay
        visible={isLoading}
        message={isLogin ? 'Logging in...' : 'Creating account...'}
      />
    </KeyboardAvoidingView>
  );
}

const containerBase: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: Colors.background,
  minHeight: '100%',
  padding: Spacing.md,
};

const formContainerBase: ViewStyle = {
  width: '100%',
  maxWidth: 400,
  padding: Spacing.lg,
};

const titleBase: TextStyle = {
  fontSize: Typography.sizes.xl,
  fontWeight: Typography.weights.bold,
  textAlign: 'center',
  marginBottom: Spacing.sm,
  color: Colors.text.primary,
};

const subtitleBase: TextStyle = {
  fontSize: Typography.sizes.md,
  fontWeight: Typography.weights.regular,
  textAlign: 'center',
  marginBottom: Spacing.xl,
  color: Colors.text.secondary,
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  keyboardVisible: {
    justifyContent: 'center',
  },
  container: containerBase,
  formContainer: formContainerBase,
  desktopFormContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    ...platformShadow(0.1, 4, 2, 8),
  },
  title: titleBase,
  desktopTitle: {
    fontSize: Typography.sizes.xxl,
    marginBottom: Spacing.md,
  },
  subtitle: subtitleBase,
  desktopSubtitle: {
    fontSize: Typography.sizes.lg,
    marginBottom: Spacing.xxl,
  },
  condensedSpacing: {
    marginBottom: Spacing.md,
  },
});
