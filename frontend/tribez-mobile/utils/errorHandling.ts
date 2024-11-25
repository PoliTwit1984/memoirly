import { Platform, Alert } from 'react-native';
import { ToastManager } from '../components/Toast';

export interface AppError extends Error {
  code?: string;
  details?: any;
}

export class AuthError extends Error implements AppError {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'AUTH_ERROR', details?: any) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  EMAIL_IN_USE: 'EMAIL_IN_USE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  UNKNOWN: 'UNKNOWN',
} as const;

export const getErrorMessage = (error: AppError): string => {
  switch (error.code) {
    case ERROR_CODES.INVALID_CREDENTIALS:
      return 'Invalid email or password';
    case ERROR_CODES.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again';
    case ERROR_CODES.EMAIL_IN_USE:
      return 'This email is already registered';
    case ERROR_CODES.INVALID_EMAIL:
      return 'Please enter a valid email address';
    case ERROR_CODES.WEAK_PASSWORD:
      return 'Password must be at least 8 characters long and contain at least one number';
    default:
      return error.message || 'An unexpected error occurred';
  }
};

export const handleError = (error: any): AppError => {
  if (error instanceof AuthError) {
    return error;
  }

  // Handle network errors
  if (
    (Platform.OS === 'web' && !navigator.onLine) ||
    error.message?.includes('Network Error')
  ) {
    return new AuthError(
      'Network error. Please check your connection and try again',
      ERROR_CODES.NETWORK_ERROR,
      error
    );
  }

  // Handle API errors
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 401:
        return new AuthError(
          'Invalid email or password',
          ERROR_CODES.INVALID_CREDENTIALS,
          data
        );
      case 409:
        return new AuthError(
          'This email is already registered',
          ERROR_CODES.EMAIL_IN_USE,
          data
        );
      default:
        return new AuthError(
          data?.message || 'An unexpected error occurred',
          ERROR_CODES.UNKNOWN,
          data
        );
    }
  }

  // Handle validation errors
  if (error.message?.includes('email')) {
    return new AuthError(
      'Please enter a valid email address',
      ERROR_CODES.INVALID_EMAIL,
      error
    );
  }

  if (error.message?.includes('password')) {
    return new AuthError(
      'Password must be at least 8 characters long and contain at least one number',
      ERROR_CODES.WEAK_PASSWORD,
      error
    );
  }

  // Default error
  return new AuthError(
    'An unexpected error occurred',
    ERROR_CODES.UNKNOWN,
    error
  );
};

export const showErrorAlert = (error: AppError): void => {
  const message = getErrorMessage(error);
  
  if (Platform.OS === 'web') {
    ToastManager.show(message, 'error');
  } else {
    Alert.alert('Error', message);
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, one number
  const passwordRegex = /^(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateForm = (
  email: string,
  password: string
): { isValid: boolean; error?: AppError } => {
  if (!email || !password) {
    return {
      isValid: false,
      error: new AuthError(
        'Please fill in all fields',
        ERROR_CODES.UNKNOWN
      ),
    };
  }

  if (!validateEmail(email)) {
    return {
      isValid: false,
      error: new AuthError(
        'Please enter a valid email address',
        ERROR_CODES.INVALID_EMAIL
      ),
    };
  }

  if (!validatePassword(password)) {
    return {
      isValid: false,
      error: new AuthError(
        'Password must be at least 8 characters long and contain at least one number',
        ERROR_CODES.WEAK_PASSWORD
      ),
    };
  }

  return { isValid: true };
};

// Success message helper
export const showSuccessMessage = (message: string): void => {
  if (Platform.OS === 'web') {
    ToastManager.show(message, 'success');
  } else {
    Alert.alert('Success', message);
  }
};

// Info message helper
export const showInfoMessage = (message: string): void => {
  if (Platform.OS === 'web') {
    ToastManager.show(message, 'info');
  } else {
    Alert.alert('Info', message);
  }
};

// Warning message helper
export const showWarningMessage = (message: string): void => {
  if (Platform.OS === 'web') {
    ToastManager.show(message, 'warning');
  } else {
    Alert.alert('Warning', message);
  }
};
