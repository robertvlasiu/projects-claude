import React from 'react';
import { Alert } from 'react-native';
import SetPinScreen from './SetPinScreen';

// Reuses the PIN-creation flow to change an existing PIN, then returns to Settings.
export default function ChangePinScreen({ navigation }: any) {
  return (
    <SetPinScreen
      onComplete={() => {
        Alert.alert('PIN updated', 'Your new PIN is now active.');
        navigation.goBack();
      }}
    />
  );
}
