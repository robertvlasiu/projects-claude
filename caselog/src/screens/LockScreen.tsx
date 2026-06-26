import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { getStoredPin } from '../lib/pin';
import { authenticateBiometric, getBiometricSupport, isBiometricEnabled } from '../lib/security';

type Props = {
  onUnlock: () => void;
};

const DIGITS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function LockScreen({ onUnlock }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint' | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  const tryBiometrics = useCallback(async () => {
    // App-handled biometrics only — never falls back to the OS passcode prompt.
    const ok = await authenticateBiometric('Unlock Auris');
    if (ok) onUnlock();
  }, [onUnlock]);

  useEffect(() => {
    async function setup() {
      const enabled = await isBiometricEnabled();
      if (!enabled) return; // user hasn't activated Face ID / Touch ID for their account
      const support = await getBiometricSupport();
      if (!support.available) return;
      setBiometricsAvailable(true);
      setBiometricType(support.type);
      setTimeout(tryBiometrics, 400);
    }
    setup();
  }, [tryBiometrics]);

  function shake() {
    Vibration.vibrate(400);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function animateDot(index: number) {
    Animated.sequence([
      Animated.timing(dotAnims[index], { toValue: 1.4, duration: 80, useNativeDriver: true }),
      Animated.timing(dotAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }

  function handleDigit(digit: string) {
    if (digit === '⌫') {
      setPin(p => p.slice(0, -1));
      setError('');
      return;
    }
    if (digit === '') return;
    if (pin.length >= 4) return;

    const next = pin + digit;
    animateDot(pin.length);
    setPin(next);

    if (next.length === 4) {
      setTimeout(() => checkPin(next), 150);
    }
  }

  async function checkPin(entered: string) {
    const stored = await getStoredPin();
    if (entered === stored) {
      onUnlock();
    } else {
      shake();
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  }

  const biometricLabel = biometricType === 'face' ? 'Face ID' : 'Touch ID';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#ffffff', '#f0f4ff']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>A</Text>
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Enter your PIN to unlock</Text>
      </View>

      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(i => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.dotFilled,
              { transform: [{ scale: dotAnims[i] }] },
            ]}
          />
        ))}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.pad}>
        {DIGITS.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((d, c) => (
              <TouchableOpacity
                key={c}
                style={[styles.key, d === '' && styles.keyEmpty]}
                onPress={() => handleDigit(d)}
                activeOpacity={d === '' ? 1 : 0.6}
                disabled={d === ''}
              >
                <Text style={[styles.keyText, d === '⌫' && styles.keyBackspace]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {biometricsAvailable && (
        <TouchableOpacity style={styles.biometricBtn} onPress={tryBiometrics}>
          <Ionicons
            name={biometricType === 'face' ? 'scan-outline' : 'finger-print'}
            size={18}
            color="#4f46e5"
          />
          <Text style={styles.biometricText}>Use {biometricLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoMark: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  logoMarkText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '800', color: '#1e1b4b', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  dotsRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: '#4f46e5', backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: '#4f46e5' },
  error: { fontSize: 13, color: '#ef4444', marginBottom: 8 },
  pad: { marginTop: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  key: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  keyEmpty: { backgroundColor: 'transparent', shadowOpacity: 0, borderWidth: 0 },
  keyText: { fontSize: 24, fontWeight: '600', color: '#1e1b4b' },
  keyBackspace: { fontSize: 20 },
  biometricBtn: { marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 8 },
  biometricText: { fontSize: 15, color: '#4f46e5', fontWeight: '600' },
});
