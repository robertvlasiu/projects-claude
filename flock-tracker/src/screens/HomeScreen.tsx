import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import {
  toDateKey,
  getEggStatsForPeriod,
  formatDateShort,
  getEggStreak,
  generateId,
} from '../utils/helpers';
import { RootStackParamList, RootTabParamList } from '../types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

const QUICK_COUNTS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { birds, eggLogs, healthRecords, hatchBatches, feedLogs, isPremium, addEggLog, deleteEggLog } = useStore();
  const [customInput, setCustomInput] = useState('');

  const today = toDateKey();
  const todayLog = eggLogs.find((l) => l.date === today);
  const todayCount = todayLog?.count ?? 0;
  const streak = getEggStreak(eggLogs);

  const activeHens = birds.filter((b) => b.isActive && b.sex === 'hen').length;
  const activeBirds = birds.filter((b) => b.isActive).length;
  const stats7 = getEggStatsForPeriod(eggLogs, 7);

  const recentHealth = healthRecords.slice(0, 2);
  const activeIncubating = hatchBatches.filter((b) => b.status === 'incubating');

  const logEggs = (count: number) => {
    addEggLog({ id: todayLog?.id ?? generateId(), date: today, count });
    setCustomInput('');
  };

  const handleCustomLog = () => {
    const n = parseInt(customInput);
    if (!isNaN(n) && n >= 0) logEggs(n);
  };

  const navActions = [
    {
      emoji: '🐔',
      label: 'Add Bird',
      sub: `${activeBirds} in flock`,
      onPress: () => navigation.navigate('AddBird', {}),
    },
    {
      emoji: '🐣',
      label: 'New Hatch',
      sub: activeIncubating.length > 0 ? `${activeIncubating.length} active` : 'Start batch',
      onPress: () => navigation.navigate('Hatch'),
    },
    {
      emoji: '🌾',
      label: 'Log Feed',
      sub: feedLogs.length > 0 ? formatDateShort(feedLogs[0].date) : 'Track costs',
      onPress: () => navigation.navigate('Feed'),
    },
    {
      emoji: '💊',
      label: 'Health',
      sub: recentHealth.length > 0 ? formatDateShort(recentHealth[0].date) : 'All good',
      onPress: () => navigation.navigate('Flock'),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Compact amber header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Your Flock</Text>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <View style={styles.streakChip}>
                <Text style={styles.streakChipText}>🔥 {streak}d</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.gearBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.gearBtnText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statBig}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statBig}>{stats7.daily}</Text>
            <Text style={styles.statLabel}>7d avg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statBig}>{activeBirds}</Text>
            <Text style={styles.statLabel}>Birds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statBig}>{activeHens}</Text>
            <Text style={styles.statLabel}>Hens</Text>
          </View>
        </View>
      </View>

      {/* Inline egg logger — always visible, never navigates */}
      <View style={styles.loggerCard}>
        <View style={styles.loggerHeader}>
          <Text style={styles.loggerTitle}>
            {todayLog
              ? `✓  ${todayCount} egg${todayCount !== 1 ? 's' : ''} logged today`
              : 'Log today\'s eggs'}
          </Text>
          {todayLog && (
            <TouchableOpacity onPress={() => deleteEggLog(todayLog.id)}>
              <Text style={styles.clearLink}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.quickRow}>
          {QUICK_COUNTS.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.numBtn, todayLog?.count === n && styles.numBtnActive]}
              onPress={() => logEggs(n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.numBtnText, todayLog?.count === n && styles.numBtnTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.customPair}>
            <TextInput
              style={styles.customInput}
              value={customInput}
              onChangeText={setCustomInput}
              keyboardType="number-pad"
              placeholder="…"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
              returnKeyType="done"
              onSubmitEditing={handleCustomLog}
            />
            <TouchableOpacity style={styles.customBtn} onPress={handleCustomLog}>
              <Text style={styles.customBtnText}>✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable remainder */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 2×2 navigation actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          {navActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionCard}
              onPress={a.onPress}
              activeOpacity={0.75}
            >
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionSub}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active incubation batches */}
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
                  style={styles.batchCard}
                  onPress={() => navigation.navigate('Hatch')}
                  activeOpacity={0.8}
                >
                  <View style={styles.batchTop}>
                    <Text style={styles.batchName}>{batch.name}</Text>
                    <Text style={styles.batchBadge}>Day {dayNum} · {daysLeft}d left</Text>
                  </View>
                  <Text style={styles.batchMeta}>
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

        {/* Recent health */}
        {recentHealth.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT HEALTH</Text>
            {recentHealth.map((record) => {
              const bird = birds.find((b) => b.id === record.birdId);
              return (
                <TouchableOpacity
                  key={record.id}
                  style={styles.healthRow}
                  onPress={() => bird && navigation.navigate('BirdDetail', { birdId: bird.id })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.healthDot, { backgroundColor: colors.healthColors[record.type] ?? colors.textMuted }]} />
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

        {/* Upgrade nudge */}
        {!isPremium && activeBirds >= 4 && (
          <TouchableOpacity
            style={styles.upgradeNudge}
            onPress={() => navigation.navigate('Upgrade')}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeNudgeText}>
              ⭐ Unlock unlimited birds — upgrade to Premium
            </Text>
          </TouchableOpacity>
        )}

        {birds.length === 0 && (
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              💡 Start by tapping "Add Bird" above to register each of your hens. Then log eggs right here every day.
            </Text>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: { fontSize: font.xxl, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  streakChipText: { fontSize: font.xs, color: '#fff', fontWeight: '700' },
  gearBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearBtnText: { fontSize: 17 },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBig: { fontSize: font.xl, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  loggerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginTop: -radius.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.md,
    zIndex: 10,
  },
  loggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loggerTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  clearLink: { fontSize: font.sm, color: colors.error, fontWeight: '600' },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  numBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  numBtnText: { fontSize: font.sm, fontWeight: '700', color: colors.textSecondary },
  numBtnTextActive: { color: '#fff' },
  customPair: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  customInput: {
    width: 44,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    textAlign: 'center',
    fontSize: font.sm,
    color: colors.text,
    fontWeight: '700',
  },
  customBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnText: { fontSize: font.md, color: '#fff', fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },

  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    width: '48%' as any,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionEmoji: { fontSize: 26 },
  actionLabel: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  actionSub: { fontSize: font.xs, color: colors.textMuted, position: 'absolute', bottom: spacing.sm, right: spacing.md },

  batchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  batchTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  batchName: { fontSize: font.md, fontWeight: '700', color: colors.text },
  batchBadge: { fontSize: font.xs, fontWeight: '700', color: colors.primaryDark, backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  batchMeta: { fontSize: font.xs, color: colors.textMuted, marginBottom: spacing.sm },
  progressBg: { height: 5, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%' as any, backgroundColor: colors.secondary, borderRadius: radius.full },

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
  healthDot: { width: 9, height: 9, borderRadius: 5, flexShrink: 0 },
  healthInfo: { flex: 1 },
  healthBird: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  healthNote: { fontSize: font.xs, color: colors.textMuted, marginTop: 1 },
  healthDate: { fontSize: font.xs, color: colors.textMuted },

  upgradeNudge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  upgradeNudgeText: { fontSize: font.sm, fontWeight: '700', color: colors.primaryDark },

  tipCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipText: { fontSize: font.sm, color: colors.primaryDark, lineHeight: 20 },
});
