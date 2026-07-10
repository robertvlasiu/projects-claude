import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { useSubscription } from '../hooks/useSubscription';
import {
  ENTITLEMENT_DISPLAY_NAME,
  STORE_TRIAL_DAYS,
  restorePurchases,
} from '../lib/subscription';

const PRO_FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'infinite', label: 'Unlimited incidents, expenses and records' },
  { icon: 'folder-open', label: 'Encrypted document vault with attachments' },
  { icon: 'share-social', label: 'PDF case reports for your attorney' },
  { icon: 'notifications', label: 'Court date and custody exchange alerts' },
  { icon: 'people', label: 'Full custody calendar with violation tracking' },
];

export default function SubscriptionScreen() {
  const {
    ready,
    available,
    isPro,
    status,
    refresh,
    openCustomerCenter,
  } = useSubscription();
  const [busy, setBusy] = useState<string | null>(null);
  const storeName = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  async function handleRestore() {
    setBusy('restore');
    const restored = await restorePurchases();
    setBusy(null);
    Alert.alert(
      restored ? 'Purchases restored' : 'Nothing to restore',
      restored
        ? `Your ${ENTITLEMENT_DISPLAY_NAME} subscription is active again.`
        : 'No previous subscription was found for this store account.',
    );
    if (restored) refresh();
  }

  async function handleManage() {
    setBusy('manage');
    const opened = await openCustomerCenter();
    setBusy(null);
    if (!opened) {
      Alert.alert('Unavailable', 'Could not open subscription management. Try again from your device Settings.');
    } else {
      refresh();
    }
  }

  if (!ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Subscription" />
        <View style={styles.center}>
          <ActivityIndicator color="#4f46e5" size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Subscription" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isPro ? (
          <>
            <LinearGradient
              colors={['#4f46e5', '#7c3aed']}
              style={styles.activeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.activeBadgeText}>{ENTITLEMENT_DISPLAY_NAME} active</Text>
              </View>
              <Text style={styles.activeSub}>
                {status?.inTrial
                  ? `Free trial — renews ${status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : 'automatically'}`
                  : status?.willRenew
                    ? `Renews ${status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : 'automatically'}`
                    : status?.expiresAt
                      ? `Cancelled — access until ${new Date(status.expiresAt).toLocaleDateString()}`
                      : 'Active'}
              </Text>
              {status?.productIdentifier ? (
                <Text style={styles.activePlan}>Plan: {status.productIdentifier}</Text>
              ) : null}
            </LinearGradient>

            <TouchableOpacity
              style={styles.manageBtn}
              onPress={handleManage}
              disabled={!!busy}
              activeOpacity={0.85}
            >
              {busy === 'manage' ? (
                <ActivityIndicator color="#4f46e5" size="small" />
              ) : (
                <>
                  <Ionicons name="person-circle-outline" size={18} color="#4f46e5" />
                  <Text style={styles.manageBtnText}>Manage subscription</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.note}>
              Use Customer Center to change plans, restore purchases, or cancel. Billing is managed
              through your {storeName} account.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.heroWrap}>
              <View style={styles.proMark}>
                <Ionicons name="shield-checkmark" size={28} color="#4f46e5" />
              </View>
              <Text style={styles.heroTitle}>{ENTITLEMENT_DISPLAY_NAME}</Text>
              <Text style={styles.heroSub}>
                {STORE_TRIAL_DAYS}-day free trial, then $4.99/month or $49.99/year. Cancel anytime in{' '}
                {storeName} Settings before the trial ends.
              </Text>
            </View>

            <View style={styles.features}>
              {PRO_FEATURES.map(f => (
                <View key={f.label} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={f.icon} size={16} color="#4f46e5" />
                  </View>
                  <Text style={styles.featureText}>{f.label}</Text>
                </View>
              ))}
            </View>

            {available ? (
              <>
                <SubscriptionPlans
                  onPurchased={() => {
                    Alert.alert(`Welcome to ${ENTITLEMENT_DISPLAY_NAME}`, 'Your subscription is active.');
                    refresh();
                  }}
                />
                <Text style={styles.note}>
                  {STORE_TRIAL_DAYS}-day free trial on all plans. After the trial, your {storeName}{' '}
                  account is charged and the subscription renews automatically until cancelled.
                </Text>
              </>
            ) : (
              <Text style={styles.unavailable}>
                Subscription options are unavailable. Check your connection and try again.
              </Text>
            )}

            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={handleRestore}
              disabled={!!busy || !available}
            >
              {busy === 'restore' ? (
                <ActivityIndicator color="#4f46e5" size="small" />
              ) : (
                <Text style={styles.restoreText}>Restore purchases</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 48 },

  heroWrap: { alignItems: 'center', marginBottom: 20 },
  proMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  features: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },

  paywallWrap: {
    minHeight: 420,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  altPaywallBtn: { alignItems: 'center', paddingVertical: 10 },
  altPaywallText: { fontSize: 13, color: '#64748b', fontWeight: '600' },

  unavailable: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 16,
  },

  restoreBtn: { alignItems: 'center', paddingVertical: 14 },
  restoreText: { fontSize: 14, color: '#4f46e5', fontWeight: '600' },

  activeCard: { borderRadius: 18, padding: 20, marginBottom: 16 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  activeBadgeText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  activeSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  activePlan: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },

  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
  },
  manageBtnText: { fontSize: 15, fontWeight: '700', color: '#4f46e5' },

  note: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
});
