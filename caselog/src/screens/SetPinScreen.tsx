import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { savePin } from '../lib/pin';
import {
  authenticateBiometric,
  getBiometricSupport,
  setBiometricEnabled,
} from '../lib/security';

type Props = {
  onComplete: () => void;
};

const DIGITS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function SetPinScreen({ onComplete }: Props) {
  const [step, setStep] = useState<'set' | 'confirm'>('set');
  const [firstPin, setFirstPin] = useState('');
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

  useEffect(() => {
    getBiometricSupport().then(s => {
      setBiometricsAvailable(s.available);
      setBiometricType(s.type);
    });
  }, []);

  const biometricLabel = biometricType === 'face' ? 'Face ID' : 'Touch ID';

  async function finish() {
    // After the PIN is confirmed, offer to turn on biometric unlock for the account.
    if (biometricsAvailable) {
      Alert.alert(
        `Enable ${biometricLabel}?`,
        `Use ${biometricLabel} to unlock Auris faster. You can change this anytime in Settings.`,
        [
          { text: 'Not now', style: 'cancel', onPress: onComplete },
          {
            text: `Enable ${biometricLabel}`,
            onPress: async () => {
              const ok = await authenticateBiometric(`Enable ${biometricLabel} for Auris`);
              await setBiometricEnabled(ok);
              onComplete();
            },
          },
        ]
      );
    } else {
      onComplete();
    }
  }

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
      setTimeout(() => handleComplete(next), 150);
    }
  }

  function handleComplete(completed: string) {
    if (step === 'set') {
      setFirstPin(completed);
      setPin('');
      setStep('confirm');
      setError('');
    } else {
      if (completed === firstPin) {
        savePin(completed).then(finish);
      } else {
        shake();
        setError("PINs don't match. Try again.");
        setPin('');
        setStep('set');
        setFirstPin('');
      }
    }
  }

  const title = step === 'set' ? 'Create your PIN' : 'Confirm your PIN';
  const subtitle = step === 'set'
    ? 'Choose a 4-digit PIN to protect your case files'
    : 'Enter the same PIN again to confirm';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#ffffff', '#f0f4ff']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>A</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
        <Text style={styles.biometricNote}>
          You can turn on {biometricLabel} right after setting your PIN
        </Text>
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
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 },
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
  biometricNote: {
    marginTop: 32, fontSize: 12, color: '#94a3b8',
    textAlign: 'center', paddingHorizontal: 48,
  },
});
