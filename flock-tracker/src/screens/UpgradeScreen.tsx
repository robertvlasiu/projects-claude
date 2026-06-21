import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';

const FEATURES = [
  { emoji: '🐔', title: 'Unlimited birds', desc: 'Track every member of your flock, no cap' },
  { emoji: '📊', title: 'Export to CSV', desc: 'Download your egg logs and feed data anytime' },
  { emoji: '🚀', title: 'All future features', desc: 'New tools added regularly — yours at no extra cost' },
  { emoji: '❤️', title: 'Support indie dev', desc: 'Built by a solo developer who keeps chickens too' },
];

export default function UpgradeScreen() {
  const navigation = useNavigation();
  const { setIsPremium } = useStore();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  const handleUpgrade = () => {
    // TODO: Replace with RevenueCat purchase
    // const packages = await Purchases.getOfferings();
    // await Purchases.purchasePackage(selectedPackage);
    setIsPremium(true);
    navigation.goBack();
  };

  const handleRestore = () => {
    // TODO: await Purchases.restorePurchases();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerEmoji}>🌟</Text>
        <Text style={styles.headerTitle}>Go Premium</Text>
        <Text style={styles.headerSub}>Your flock deserves the full picture</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.featuresList}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
              </View>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.planRow}>
          <TouchableOpacity
            style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
            onPress={() => setPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.planPrice, plan === 'monthly' && styles.planPriceActive]}>$4.99</Text>
            <Text style={[styles.planPeriod, plan === 'monthly' && styles.planPeriodActive]}>per month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, styles.planCardAnnual, plan === 'annual' && styles.planCardActive]}
            onPress={() => setPlan('annual')}
            activeOpacity={0.8}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 40%</Text>
            </View>
            <Text style={[styles.planPrice, plan === 'annual' && styles.planPriceActive]}>$29.99</Text>
            <Text style={[styles.planPeriod, plan === 'annual' && styles.planPeriodActive]}>per year</Text>
            <Text style={styles.planPerMonth}>= $2.50/mo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.trialNote}>Includes a 3-day free trial — cancel anytime</Text>

        <TouchableOpacity style={styles.ctaBtn} onPress={handleUpgrade} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>Start Free Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchase</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Payment charged to Apple ID at purchase confirmation. Subscription automatically
          renews unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.headerBg,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  closeBtn: {
    position: 'absolute',
    top: 0,
    right: spacing.xl,
    padding: spacing.md,
  },
  closeBtnText: { fontSize: font.lg, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  headerEmoji: { fontSize: 52, marginBottom: spacing.sm, marginTop: spacing.lg },
  headerTitle: { fontSize: font.xxxl, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: font.md, color: 'rgba(255,255,255,0.75)', marginTop: spacing.xs },

  content: { padding: spacing.xl, paddingTop: spacing.xxl },

  featuresList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
    gap: spacing.lg,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureEmoji: { fontSize: 22 },
  featureTextCol: { flex: 1 },
  featureTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  featureDesc: { fontSize: font.sm, color: colors.textSecondary, marginTop: 2 },

  planRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadow.sm,
    position: 'relative',
    overflow: 'visible',
  },
  planCardAnnual: { paddingTop: spacing.xxl },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  planPrice: { fontSize: font.xxl, fontWeight: '800', color: colors.textSecondary },
  planPriceActive: { color: colors.primaryDark },
  planPeriod: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  planPeriodActive: { color: colors.primaryDark },
  planPerMonth: { fontSize: font.xs, color: colors.textMuted, marginTop: 4 },
  saveBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  saveBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  trialNote: {
    fontSize: font.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },

  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  ctaBtnText: { fontSize: font.lg, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  restoreBtn: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.md },
  restoreText: { fontSize: font.sm, color: colors.primary, fontWeight: '600' },

  legalText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    paddingBottom: spacing.xl,
  },
});
