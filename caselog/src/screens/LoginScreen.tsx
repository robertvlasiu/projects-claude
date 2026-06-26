import { AntDesign, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

function useFade(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<'google' | 'apple' | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState('');

  const a0 = useFade(0);
  const a1 = useFade(80);
  const a2 = useFade(160);
  const a3 = useFade(240);
  const a4 = useFade(320);

  async function handleLogin() {
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleApple() {
    setSsoLoading('apple');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: 'auris://auth/callback' } });
    setSsoLoading(null);
    if (error) setError(error.message);
  }

  async function handleGoogle() {
    setSsoLoading('google');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'auris://auth/callback' } });
    setSsoLoading(null);
    if (error) setError(error.message);
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#fafbff', '#eef2ff']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.brand, a0]}>
          <View style={styles.logoMark}><Text style={styles.logoMarkText}>A</Text></View>
          <Text style={styles.brandName}>Welcome back</Text>
          <Text style={styles.tagline}>Sign in to access your case</Text>
        </Animated.View>

        <Animated.View style={a1}>
          <TouchableOpacity style={styles.appleBtn} onPress={handleApple} activeOpacity={0.85} disabled={!!ssoLoading}>
            {ssoLoading === 'apple' ? <ActivityIndicator color="#fff" size="small" /> : <AntDesign name="apple" size={20} color="#fff" />}
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[{ marginTop: 12 }, a2]}>
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.85} disabled={!!ssoLoading}>
            {ssoLoading === 'google' ? <ActivityIndicator color="#1a1a1a" size="small" /> : <AntDesign name="google" size={18} color="#EA4335" />}
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.divider, a3]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or use email</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        <Animated.View style={a4}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={15} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, focused === 'email' && styles.inputActive]}
              placeholder="Email address"
              placeholderTextColor="#aab4c4"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
            <TextInput
              style={[styles.input, styles.inputLast, focused === 'password' && styles.inputActive]}
              placeholder="Password"
              placeholderTextColor="#aab4c4"
              secureTextEntry
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
          </View>
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitText}>Sign In</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.switchLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchText}>No account yet? <Text style={styles.switchHighlight}>Create one</Text></Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BTN_H = 54;
const BTN_RADIUS = 16;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 48 },
  brand: { alignItems: 'center', marginBottom: 36 },
  logoMark: { width: 56, height: 56, borderRadius: 17, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10 },
  logoMarkText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  brandName: { fontSize: 28, fontWeight: '800', color: '#1e1b4b', letterSpacing: -0.8 },
  tagline: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  appleBtn: { height: BTN_H, borderRadius: BTN_RADIUS, backgroundColor: '#111', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  appleBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.1 },
  googleBtn: { height: BTN_H, borderRadius: BTN_RADIUS, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  googleBtnText: { color: '#1a1a1a', fontSize: 16, fontWeight: '600', letterSpacing: 0.1 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { fontSize: 12, color: '#aab4c4', fontWeight: '600' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 13, color: '#ef4444', lineHeight: 18 },
  inputGroup: { borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 10, backgroundColor: '#fff' },
  input: { height: 52, paddingHorizontal: 16, fontSize: 15, color: '#1e293b', backgroundColor: '#fff' },
  inputLast: { borderTopWidth: 1, borderColor: '#f1f5f9' },
  inputActive: { backgroundColor: '#fafbff' },
  forgotRow: { alignItems: 'flex-end', marginBottom: 14 },
  forgotText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  submitBtn: { height: BTN_H, borderRadius: BTN_RADIUS, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchLink: { alignItems: 'center', marginTop: 20 },
  switchText: { fontSize: 14, color: '#94a3b8' },
  switchHighlight: { color: '#4f46e5', fontWeight: '700' },
});
