import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { ToastContainer } from '../components/Toast';

export default function Layout() {
  // Prevent the splash screen from auto-hiding before asset loading is complete.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Load any resources or data for native platforms
    }
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <ToastContainer />
    </>
  );
}
