import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import {
  authenticateBiometric,
  getBiometricSupport,
  isBiometricEnabled,
  setBiometricEnabled,
} from '../lib/security';

export default function SettingsScreen({ navigation }: any) {
  const [bioSupported, setBioSupported] = useState(false);
  const [bioType, setBioType] = useState<'face' | 'fingerprint' | null>(null);
  const [bioOn, setBioOn] = useState(false);

  useEffect(() => {
    getBiometricSupport().then(s => {
      setBioSupported(s.available);
      setBioType(s.type);
    });
    isBiometricEnabled().then(setBioOn);
  }, []);

  const bioLabel = bioType === 'face' ? 'Face ID' : 'Touch ID';

  async function toggleBiometric(next: boolean) {
    if (next) {
      const ok = await authenticateBiometric(`Enable ${bioLabel} for Auris`);
      if (!ok) { Alert.alert('Not enabled', `We couldn't verify your ${bioLabel}. Try again.`); return; }
    }
    await setBiometricEnabled(next);
    setBioOn(next);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Ionicons name={bioType === 'face' ? 'scan' : 'finger-print'} size={20} color="#4f46e5" /></View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Unlock with {bioLabel}</Text>
              <Text style={styles.rowSub}>
                {bioSupported ? `Use ${bioLabel} instead of typing your PIN` : 'No biometrics enrolled on this device'}
              </Text>
            </View>
            <Switch
              value={bioOn}
              onValueChange={toggleBiometric}
              disabled={!bioSupported}
              trackColor={{ true: '#a5b4fc', false: '#e2e8f0' }}
              thumbColor={bioOn ? '#4f46e5' : '#f1f5f9'}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePin')}>
            <View style={styles.rowIcon}><Ionicons name="keypad" size={20} color="#4f46e5" /></View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Change PIN</Text>
              <Text style={styles.rowSub}>Set a new 4-digit unlock PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Privacy &amp; Encryption</Text>
        <View style={styles.card}>
          <View style={styles.encHeader}>
            <Ionicons name="lock-closed" size={18} color="#10b981" />
            <Text style={styles.encTitle}>Your case is encrypted</Text>
          </View>
          <Text style={styles.encBody}>
            Every incident, message, expense, note and uploaded file is encrypted on your device
            with AES before it&apos;s stored. Your PIN never leaves your phone, and the system
            passcode is never used to unlock Auris.
          </Text>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>Records encrypted before upload</Text></View>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>Attachments encrypted, stored privately</Text></View>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>PIN stored in your device&apos;s secure keystore</Text></View>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>Only your account can read your data</Text></View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 12, marginBottom: 4, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 4, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  rowSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 66 },
  encHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, paddingBottom: 8 },
  encTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  encBody: { fontSize: 13, color: '#64748b', lineHeight: 19, paddingHorizontal: 14, marginBottom: 10 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 4 },
  bulletText: { fontSize: 13, color: '#334155' },
});
