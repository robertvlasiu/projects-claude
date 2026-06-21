import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { toDateKey, getEggStatsForPeriod, formatDateShort, getEggStreak } from '../utils/helpers';
import { RootStackParamList, RootTabParamList } from '../types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { birds, eggLogs, healthRecords, hatchBatches, feedLogs, isPremium } = useStore();

  const today = toDateKey();
  const todayLog = eggLogs.find((l) => l.date === today);
  const todayCount = todayLog?.count ?? 0;
  const streak = getEggStreak(eggLogs);

  const activeHens = birds.filter((b) => b.isActive && b.sex === 'hen').length;
  const activeBirds = birds.filter((b) => b.isActive).length;

  const stats7 = getEggStatsForPeriod(eggLogs, 7);
  const stats30 = getEggStatsForPeriod(eggLogs, 30);

  const recentHealth = healthRecords.slice(0, 3);
  const activeIncubating = hatchBatches.filter((b) => b.status === 'incubating');

  const layingRate =
    activeHens > 0 && stats7.total > 0
      ? Math.round((stats7.daily / activeHens) * 100)
      : 0;

  const actions = [
    {
      emoji: '🥚',
      title: 'Log Eggs',
      sub: todayLog ? `${todayCount} collected today ✓` : 'Not logged yet',
      accentBg: todayLog ? '#D1FAE5' : colors.primaryLight,
      accentText: todayLog ? colors.secondary : colors.primaryDark,
      done: !!todayLog,
      onPress: () => navigation.navigate('Eggs'),
    },
    {
      emoji: '🐔',
      title: 'Add Bird',
      sub: activeBirds > 0 ? `${activeBirds} in your flock` : 'Get started here',
      accentBg: colors.primaryLight,
      accentText: colors.primaryDark,
      done: false,
      onPress: () => navigation.navigate('AddBird', {}),
    },
    {
      emoji: '🐣',
      title: 'New Hatch',
      sub: activeIncubating.length > 0
        ? `${activeIncubating.length} batch${activeIncubating.length !== 1 ? 'es' : ''} incubating`
        : 'Start incubating',
      accentBg: '#FEF9C3',
      accentText: '#92400E',
      done: false,
      onPress: () => navigation.navigate('Hatch'),
    },
    {
      emoji: '🌾',
      title: 'Log Feed',
      sub: feedLogs.length > 0
        ? `Last: ${formatDateShort(feedLogs[0].date)}`
        : 'Track your costs',
      accentBg: colors.secondaryLight,
      accentText: colors.secondaryDark,
      done: false,
      onPress: () => navigation.navigate('Feed'),
    },
    {
      emoji: '💊',
      title: 'Health Record',
      sub: recentHealth.length > 0
        ? `Last: ${formatDateShort(recentHealth[0].date)}`
        : 'All looking good',
      accentBg: '#EDE9FE',
      accentText: '#5B21B6',
      done: false,
      onPress: () => navigation.navigate('Flock'),
    },
    {
      emoji: isPremium ? '⭐' : '🔓',
      title: 'Settings',
      sub: isPremium ? 'Premium active' : 'Upgrade available',
      accentBg: isPremium ? colors.primaryLight : '#F1F5F9',
      accentText: isPremium ? colors.primaryDark : colors.textSecondary,
      done: false,
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Amber header band */}
      <View style={[styles.headerBand, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning 🌅</Text>
            <Text style={styles.title}>Your Flock</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Egg hero */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => navigation.navigate('Eggs')}
          activeOpacity={0.9}
        >
          <View style={styles.heroLeft}>
            <Text style={styles.heroEmoji}>🥚</Text>
            <View>
              <Text style={styles.heroLabel}>Today's Eggs</Text>
              <Text style={styles.heroCount}>{todayCount}</Text>
              <Text style={styles.heroSub}>
                {activeHens} hen{activeHens !== 1 ? 's' : ''} · {layingRate}% laying
              </Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak}-day streak</Text>
              </View>
            )}
            <Text style={styles.heroPeriodLabel}>7-day avg</Text>
            <Text style={styles.heroAvg}>{stats7.daily}/day</Text>
            <Text style={styles.heroPeriodLabel}>30-day total</Text>
            <Text style={styles.heroTotal}>{stats30.total}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {actions.map((a) => (
            <TouchableOpacity
              key={a.title}
              style={styles.actionCard}
              onPress={a.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconBox, { backgroundColor: a.accentBg }]}>
                <Text style={styles.actionEmoji}>{a.emoji}</Text>
              </View>
              <Text style={styles.actionTitle}>{a.title}</Text>
              <Text style={[styles.actionSub, { color: a.done ? colors.secondary : colors.textMuted }]}>
                {a.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Flock at-a-glance row */}
        {activeBirds > 0 && (
          <>
            <Text style={styles.sectionLabel}>FLOCK</Text>
            <TouchableOpacity
              style={styles.flockRow}
              onPress={() => navigation.navigate('Flock')}
              activeOpacity={0.8}
            >
              {[
                { label: 'Active Birds', value: activeBirds, emoji: '🐔' },
                { label: 'Hens', value: activeHens, emoji: '🥚' },
                { label: 'Roosters', value: birds.filter(b => b.isActive && b.sex === 'rooster').length, emoji: '🐓' },
              ].map((s, i, arr) => (
                <View
                  key={s.label}
                  style={[styles.flockStat, i < arr.length - 1 && styles.flockStatBorder]}
                >
                  <Text style={styles.flockStatEmoji}>{s.emoji}</Text>
                  <Text style={styles.flockStatValue}>{s.value}</Text>
                  <Text style={styles.flockStatLabel}>{s.label}</Text>
                </View>
              ))}
            </TouchableOpacity>
          </>
        )}

        {/* Active incubations */}
        {activeIncubating.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>INCUBATING</Text>
            {activeIncubating.map((batch) => {
              const start = new Date(batch.startDate);
              const expected = new Date(batch.expectedHatchDate);
              const now = new Date();
              const totalDays = (expected.getTime() - start.getTime()) / 86400000;
              const elapsed = (now.getTime() - start.getTime()) / 86400000;
              const progress = Math.min(elapsed / totalDays, 1);
              const daysLeft = Math.max(0, Math.ceil((expected.getTime() - now.getTime()) / 86400000));
              const dayNum = Math.min(Math.ceil(elapsed), 21);

              return (
                <TouchableOpacity
                  key={batch.id}
                  style={styles.hatchCard}
                  onPress={() => navigation.navigate('Hatch')}
                  activeOpacity={0.8}
                >
                  <View style={styles.hatchTop}>
                    <Text style={styles.hatchName}>{batch.name}</Text>
                    <View style={styles.daysLeftBadge}>
                      <Text style={styles.daysLeftText}>Day {dayNum} · {daysLeft}d left</Text>
                    </View>
                  </View>
                  <Text style={styles.hatchMeta}>
                    {batch.eggsSet} eggs · {batch.breed ?? 'Mixed'} · Due {formatDateShort(batch.expectedHatchDate)}
                  </Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Recent health events */}
        {recentHealth.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT HEALTH</Text>
            {recentHealth.map((record) => {
              const bird = birds.find((b) => b.id === record.birdId);
              const dotColor = colors.healthColors[record.type] ?? colors.textMuted;
              return (
                <TouchableOpacity
                  key={record.id}
                  style={styles.healthRow}
                  onPress={() => bird && navigation.navigate('BirdDetail', { birdId: bird.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.healthDot, { backgroundColor: dotColor }]} />
                  <View style={styles.healthInfo}>
                    <Text style={styles.healthBird}>{bird?.name ?? 'Unknown'}</Text>
                    <Text style={styles.healthNote} numberOfLines={1}>{record.notes}</Text>
                  </View>
                  <Text style={styles.healthDate}>{formatDateShort(record.date)}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* First-time tip — only shown when truly empty */}
        {birds.length === 0 && eggLogs.length === 0 && (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Start here</Text>
            <Text style={styles.tipText}>
              Tap "Add Bird" above to add each of your hens. Then use "Log Eggs" every day to start tracking production.
            </Text>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerBand: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: { fontSize: font.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontWeight: '500' },
  title: { fontSize: font.xxxl, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnText: { fontSize: 20 },

  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroEmoji: { fontSize: 40 },
  heroLabel: { fontSize: font.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 2 },
  heroCount: { fontSize: 48, fontWeight: '800', color: '#fff', lineHeight: 52 },
  heroSub: { fontSize: font.xs, color: 'rgba(255,255,255,0.65)' },
  heroRight: { alignItems: 'flex-end', gap: 2 },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  streakText: { fontSize: font.xs, color: '#fff', fontWeight: '700' },
  heroPeriodLabel: { fontSize: font.xs, color: 'rgba(255,255,255,0.6)' },
  heroAvg: { fontSize: font.xl, fontWeight: '800', color: '#fff', marginBottom: spacing.sm },
  heroTotal: { fontSize: font.lg, fontWeight: '700', color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionCard: {
    width: '48%' as any,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionEmoji: { fontSize: 24 },
  actionTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: 3 },
  actionSub: { fontSize: font.xs, lineHeight: 16 },

  flockRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },
  flockStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  flockStatBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  flockStatEmoji: { fontSize: 20, marginBottom: 3 },
  flockStatValue: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  flockStatLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },

  hatchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  hatchTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hatchName: { fontSize: font.md, fontWeight: '700', color: colors.text },
  daysLeftBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  daysLeftText: { fontSize: font.xs, fontWeight: '700', color: colors.primaryDark },
  hatchMeta: { fontSize: font.sm, color: colors.textMuted, marginBottom: spacing.sm },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%' as any,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
  },

  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  healthDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  healthInfo: { flex: 1 },
  healthBird: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  healthNote: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
  healthDate: { fontSize: font.xs, color: colors.textMuted, flexShrink: 0 },

  tipCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipTitle: { fontSize: font.sm, fontWeight: '700', color: colors.primaryDark, marginBottom: 4 },
  tipText: { fontSize: font.sm, color: colors.primaryDark, lineHeight: 20, opacity: 0.85 },
});
