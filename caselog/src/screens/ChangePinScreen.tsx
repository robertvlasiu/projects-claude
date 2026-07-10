import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import SetPinScreen from './SetPinScreen';
import { getUserId } from '../lib/supabase';

// Reuses the PIN-creation flow to change an existing PIN, then returns to Settings.
export default function ChangePinScreen({ navigation }: any) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  if (!userId) return null;

  return (
    <SetPinScreen
      userId={userId}
      onComplete={() => {
        Alert.alert('PIN updated', 'Your new PIN is now active.');
        navigation.goBack();
      }}
    />
  );
}
