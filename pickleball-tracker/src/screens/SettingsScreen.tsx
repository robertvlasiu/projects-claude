import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useStore, FREE_LIMIT } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';

export default function SettingsScreen() {
  const { matches, drillSessions, isPremium, setIsPremium } = useStore();

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock unlimited match history, advanced skill charts, and partner tracking.\n\n$6.99/month or $49.99/year',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe $6.99/mo',
          onPress: () => {
            setIsPremium(true);
            Alert.alert('Welcome to Premium! 🎉', 'You now have unlimited access.');
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert('Restore Purchases', 'No previous purchases found.');
  };

  const wins = matches.filter((m) => m.isWin).length;
  const losses = matches.filter((m) => !m.isWin).length;
  const totalDrillTime = drillSessions.reduce((s, d) => s + d.durationSeconds, 0);
  const drillMins = Math.round(totalDrillTime / 60);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Stats summary */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Matches', value: matches.length },
              { label: 'Wins', value: wins, color: colors.win },
              { label: 'Losses', value: losses, color: colors.loss },
              { label: 'Drills Done', value: drillSessions.length },
              { label: 'Drill Minutes', value: drillMins },
              { label: 'Win Rate', value: matches.length ? `${Math.round((wins / matches.length) * 100)}%` : '—' },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, s.color ? { color: s.color } : {}]}>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Premium */}
        {!isPremium ? (
          <View style={styles.premiumCard}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>FREE PLAN</Text>
            </View>
            <Text style={styles.premiumTitle}>Unlock Premium</Text>
            <Text style={styles.premiumDesc}>
              You've logged {matches.length} of {FREE_LIMIT} free matches. Go premium for unlimited history, skill trend charts, and more.
            </Text>
            <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
              <Text style={styles.upgradeBtnText}>Upgrade — $6.99/month</Text>
            </TouchableOpacity>
            <Text style={styles.yearlyHint}>or $49.99/year (save 40%)</Text>
          </View>
        ) : (
          <View style={[styles.premiumCard, styles.premiumCardActive]}>
            <Text style={styles.premiumActiveTitle}>🏆 Premium Member</Text>
            <Text style={styles.premiumActiveDesc}>You have unlimited access. Thank you for supporting the app!</Text>
          </View>
        )}

        {/* Settings rows */}
        <View style={styles.menuCard}>
          {[
            { label: 'Rate the App', icon: '⭐️', onPress: () => Alert.alert('Rate', 'Opens App Store in production.') },
            { label: 'Share with Friends', icon: '📤', onPress: () => Alert.alert('Share', 'Share sheet opens in production.') },
            { label: 'Restore Purchases', icon: '🔄', onPress: handleRestore },
            { label: 'Privacy Policy', icon: '🔒', onPress: () => {} },
            { label: 'Contact Support', icon: '💬', onPress: () => Alert.alert('Support', 'Email: support@pickleball-tracker.app') },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < arr.length - 1 && styles.menuRowBorder]}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Pickleball Tracker v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.lg,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  content: { padding: spacing.xl, paddingTop: spacing.sm },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statValue: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  premiumCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    ...shadow.sm,
  },
  premiumCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  premiumBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  premiumBadgeText: { fontSize: font.xs, fontWeight: '800', color: '#92400E', letterSpacing: 1 },
  premiumTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  premiumDesc: {
    fontSize: font.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  upgradeBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  upgradeBtnText: { fontSize: font.md, fontWeight: '800', color: '#fff' },
  yearlyHint: { fontSize: font.sm, color: colors.textMuted },
  premiumActiveTitle: { fontSize: font.xl, fontWeight: '800', color: colors.primaryDark, marginBottom: spacing.xs },
  premiumActiveDesc: { fontSize: font.md, color: colors.primaryDark, textAlign: 'center', opacity: 0.8 },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: { fontSize: font.lg, width: 28 },
  menuLabel: { flex: 1, fontSize: font.md, color: colors.text },
  menuArrow: { fontSize: font.xl, color: colors.textMuted },
  version: { textAlign: 'center', fontSize: font.sm, color: colors.textMuted, marginTop: spacing.md },
});
