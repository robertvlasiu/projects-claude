import AsyncStorage from '@react-native-async-storage/async-storage';

function onboardingKey(userId: string): string {
  return `auris_onboarding_done_${userId}`;
}

export function guideDismissedKey(userId: string): string {
  return `auris_guide_dismissed_${userId}`;
}

export async function isOnboardingComplete(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(onboardingKey(userId))) === '1';
}

export async function markOnboardingComplete(userId: string): Promise<void> {
  await AsyncStorage.setItem(onboardingKey(userId), '1');
}
