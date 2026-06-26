import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, View } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import { getStoredPin } from './src/lib/pin';
import LockScreen from './src/screens/LockScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SetPinScreen from './src/screens/SetPinScreen';
import SplashScreen from './src/screens/SplashScreen';
import TabNavigator from './src/navigation/TabNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  const { session, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [pinSet, setPinSet] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!session) { setPinSet(null); setLocked(true); return; }
    getStoredPin().then(pin => setPinSet(pin !== null));
  }, [session]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'active' && next === 'background') setLocked(true);
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  if (loading || (session && pinSet === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  if (session && pinSet === false) {
    return (
      <>
        <SetPinScreen onComplete={() => setPinSet(true)} />
        {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      </>
    );
  }

  if (session && pinSet && locked) {
    return <LockScreen onUnlock={() => setLocked(false)} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {session ? (
          <TabNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    </View>
  );
}
