import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubscriptionPlans from './SubscriptionPlans';
import { useSubscription } from '../hooks/useSubscription';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '../lib/config';
import { supabase } from '../lib/supabase';
import { ENTITLEMENT_DISPLAY_NAME, STORE_TRIAL_DAYS, restorePurchases } from '../lib/subscription';

const FEATURES = [
  'Unlimited incidents, expenses and records',
  'Encrypted document vault with attachments',
  'PDF case reports for your attorney',
  'Court date and custody exchange alerts',
  'Full custody calendar with violation tracking',
];

/** Blocks the app until the user starts a subscription (incl. introductory free trial). */
export default function PaywallGate({ children }: { children: React.ReactNode }) {
  const { ready, available, hasAccess, refresh } = useSubscription();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#4f46e5" size="large" />
      </View>
    );
  }

  if (hasAccess) return <>{children}</>;

  return <SubscribePaywall available={available} refresh={refresh} />;
}

function SubscribePaywall({
  available,
  refresh,
}: {
  available: boolean;
  refresh: () => Promise<void>;
}) {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  async function handleRestore() {
    setBusy(true);
    const restored = await restorePurchases();
    setBusy(false);
    if (restored) {
      Alert.alert('Welcome back', `Your ${ENTITLEMENT_DISPLAY_NAME} subscription is active.`);
      refresh();
    } else {
      Alert.alert('Nothing to restore', 'No subscription was found for this account.');
    }
  }

  function onPurchased() {
    Alert.alert(`Welcome to ${ENTITLEMENT_DISPLAY_NAME}`, 'Your subscription is active.');
    refresh();
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="gift-outline" size={28} color="#fff" />
          <Text style={styles.heroTitle}>{STORE_TRIAL_DAYS}-day free trial</Text>
          <Text style={styles.heroSub}>
            Try {ENTITLEMENT_DISPLAY_NAME} free for {STORE_TRIAL_DAYS} days. Choose monthly or yearly —
            cancel anytime in {storeName} Settings before the trial ends and you won&apos;t be charged.
          </Text>
        </LinearGradient>

        <View style={styles.features}>
          {FEATURES.map(label => (
            <View key={label} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.featureText}>{label}</Text>
            </View>
          ))}
        </View>

        {available ? (
          <>
            <SubscriptionPlans onPurchased={onPurchased} />
            <Text style={styles.legal}>
              Payment will be charged to your {storeName} account after the {STORE_TRIAL_DAYS}-day free
              trial. Subscription automatically renews unless cancelled at least 24 hours before the end
              of the current period. Manage or cancel in {storeName} account settings. See our{' '}
              <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                Privacy Policy
              </Text>
              {' '}and{' '}
              <Text style={styles.legalLink} onPress={() => Linking.openURL(TERMS_OF_USE_URL)}>
                Terms of Use
              </Text>
              .
            </Text>
          </>
        ) : (
          <Text style={styles.unavailable}>
            Unable to load subscription options. Check your connection and restart the app.
          </Text>
        )}

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={busy || !available}>
          {busy ? (
            <ActivityIndicator color="#4f46e5" size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore purchases</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={() => supabase.auth.signOut()}>
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
          <Text style={styles.signOutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  root: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 32 },
  hero: { borderRadius: 18, padding: 22, alignItems: 'center', gap: 8, marginBottom: 20 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 21 },
  features: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { flex: 1, fontSize: 14, color: '#334155' },
  legal: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  legalLink: { color: '#4f46e5', fontWeight: '600' },
  unavailable: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 24,
  },
  restoreBtn: { alignItems: 'center', paddingVertical: 18 },
  restoreText: { fontSize: 14, color: '#4f46e5', fontWeight: '600' },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  signOutText: { fontSize: 13, color: '#ef4444', fontWeight: '600' },
});
