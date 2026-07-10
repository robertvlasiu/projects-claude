import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingTutorial from './src/components/OnboardingTutorial';
import ConfigErrorScreen from './src/components/ConfigErrorScreen';
import PaywallGate from './src/components/PaywallGate';
import { SubscriptionProvider } from './src/hooks/useSubscription';
import { useAuth } from './src/hooks/useAuth';
import { getAppConfigStatus } from './src/lib/config';
import { isOnboardingComplete, markOnboardingComplete } from './src/lib/onboarding';
import { getStoredPin } from './src/lib/pin';
import LockScreen from './src/screens/LockScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SetPinScreen from './src/screens/SetPinScreen';
import SplashScreen from './src/screens/SplashScreen';
import TabNavigator from './src/navigation/TabNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

function AppInner() {
  const config = getAppConfigStatus();
  const { session, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!session) {
      setPinSet(null);
      setLocked(true);
      setOnboardingDone(null);
      setUserId(null);
      return;
    }
    const uid = session.user.id;
    setUserId(uid);
    Promise.all([getStoredPin(uid), isOnboardingComplete(uid)]).then(([pin, done]) => {
      setPinSet(pin !== null);
      // No PIN yet → always show the intro, even if Skip was stored on a broken build.
      setOnboardingDone(pin ? done : false);
    });
  }, [session]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'active' && next === 'background') setLocked(true);
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  function handlePinComplete() {
    setPinSet(true);
    setLocked(false);
  }

  async function handleOnboardingComplete() {
    if (!userId) return;
    await markOnboardingComplete(userId);
    setOnboardingDone(true);
  }

  if (!config.ok) {
    return <ConfigErrorScreen missing={config.missing} />;
  }

  // Brand splash once on cold start — never stacked on tutorial / PIN screens.
  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  const bootstrapping = loading
    || (session && pinSet === null)
    || (session && onboardingDone === null);

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // First login: tutorial before PIN setup.
  if (userId && onboardingDone === false) {
    return <OnboardingTutorial onComplete={handleOnboardingComplete} />;
  }

  if (pinSet === false && userId) {
    return <SetPinScreen userId={userId} onComplete={handlePinComplete} />;
  }

  if (pinSet && locked && userId) {
    return <LockScreen userId={userId} onUnlock={() => setLocked(false)} />;
  }

  return (
    <SubscriptionProvider userId={userId}>
      <PaywallGate>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </PaywallGate>
    </SubscriptionProvider>
  );
}
