import { useEffect, useState } from 'react';
import { Keyboard, Platform, KeyboardEvent, EmitterSubscription } from 'react-native';
import { isWeb } from './platformStyles';

interface KeyboardState {
  keyboardVisible: boolean;
  keyboardHeight: number;
}

export function useKeyboard(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    keyboardVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    if (isWeb()) {
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardState({
        keyboardVisible: true,
        keyboardHeight: event.endCoordinates.height,
      });
    };

    const handleKeyboardHide = () => {
      setKeyboardState({
        keyboardVisible: false,
        keyboardHeight: 0,
      });
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardState;
}

export const dismissKeyboard = (): void => {
  if (!isWeb()) {
    Keyboard.dismiss();
  }
};

interface KeyboardSpacingProps {
  keyboardVisible: boolean;
  keyboardHeight: number;
  iosOffset?: number;
  androidOffset?: number;
}

export const getKeyboardSpacing = ({
  keyboardVisible,
  keyboardHeight,
  iosOffset = 0,
  androidOffset = 0,
}: KeyboardSpacingProps): number => {
  if (!keyboardVisible || isWeb()) {
    return 0;
  }

  const offset = Platform.OS === 'ios' ? iosOffset : androidOffset;
  return keyboardHeight + offset;
};

export const getKeyboardAvoidingViewBehavior = () => {
  return Platform.OS === 'ios' ? 'padding' : undefined;
};

export const getKeyboardVerticalOffset = (): number => {
  if (Platform.OS === 'ios') {
    return 0;
  }
  return 0;
};

export function useKeyboardDismissible(onDismiss?: () => void) {
  useEffect(() => {
    if (isWeb()) {
      return;
    }

    const keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (onDismiss) {
          onDismiss();
        }
      }
    );

    return () => {
      keyboardDidHideSubscription.remove();
    };
  }, [onDismiss]);
}

export function useKeyboardListener(
  onShow?: (event: KeyboardEvent) => void,
  onHide?: () => void
) {
  useEffect(() => {
    if (isWeb()) {
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subscriptions: EmitterSubscription[] = [];

    if (onShow) {
      subscriptions.push(
        Keyboard.addListener(showEvent, onShow)
      );
    }

    if (onHide) {
      subscriptions.push(
        Keyboard.addListener(hideEvent, onHide)
      );
    }

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, [onShow, onHide]);
}
