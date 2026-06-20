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
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { toDateKey, getEggStatsForPeriod, formatDateShort } from '../utils/helpers';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { birds, eggLogs, healthRecords, hatchBatches } = useStore();

  const today = toDateKey();
  const todayLog = eggLogs.find((l) => l.date === today);
  const todayCount = todayLog?.count ?? 0;

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

  return (
    <View style={styles.container}>
      {/* Colored header band */}
      <View style={[styles.headerBand, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning 🌅</Text>
            <Text style={styles.title}>Your Flock</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddBird', {})}
          >
            <Text style={styles.addBtnText}>+ Bird</Text>
          </TouchableOpacity>
        </View>

        {/* Egg hero inside header */}
        <View style={styles.heroCard}>
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
            <Text style={styles.heroPeriodLabel}>7-day avg</Text>
            <Text style={styles.heroAvg}>{stats7.daily}/day</Text>
            <Text style={styles.heroPeriodLabel}>30-day total</Text>
            <Text style={styles.heroTotal}>{stats30.total}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Flock summary row */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Active Birds', value: activeBirds, emoji: '🐔' },
            { label: 'Hens', value: activeHens, emoji: '🥚' },
            { label: 'Roosters', value: birds.filter(b => b.isActive && b.sex === 'rooster').length, emoji: '🐓' },
          ].map((s) => (
            <View key={s.label} style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>{s.emoji}</Text>
              <Text style={styles.summaryValue}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Empty state */}
        {birds.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐔</Text>
            <Text style={styles.emptyTitle}>Add your first bird</Text>
            <Text style={styles.emptyText}>
              Track each hen's production, health records, and more.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddBird', {})}
            >
              <Text style={styles.emptyBtnText}>Add a Bird</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Incubating batches */}
        {activeIncubating.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🥚 Incubating</Text>
            {activeIncubating.map((batch) => {
              const start = new Date(batch.startDate);
              const expected = new Date(batch.expectedHatchDate);
              const now = new Date();
              const totalDays = (expected.getTime() - start.getTime()) / 86400000;
              const elapsed = (now.getTime() - start.getTime()) / 86400000;
              const progress = Math.min(elapsed / totalDays, 1);
              const daysLeft = Math.max(0, Math.ceil((expected.getTime() - now.getTime()) / 86400000));

              return (
                <View key={batch.id} style={styles.hatchCard}>
                  <View style={styles.hatchTop}>
                    <Text style={styles.hatchName}>{batch.name}</Text>
                    <View style={styles.daysLeftBadge}>
                      <Text style={styles.daysLeftText}>{daysLeft}d left</Text>
                    </View>
                  </View>
                  <Text style={styles.hatchMeta}>{batch.eggsSet} eggs · {batch.breed ?? 'Mixed'}</Text>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                  </View>
                  <Text style={styles.hatchDue}>Expected: {formatDateShort(batch.expectedHatchDate)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent health events */}
        {recentHealth.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Health Events</Text>
            {recentHealth.map((record) => {
              const bird = birds.find((b) => b.id === record.birdId);
              const dotColor = colors.healthColors[record.type] ?? colors.textMuted;
              return (
                <View key={record.id} style={styles.healthRow}>
                  <View style={[styles.healthDot, { backgroundColor: dotColor }]} />
                  <View style={styles.healthInfo}>
                    <Text style={styles.healthBird}>{bird?.name ?? 'Unknown'}</Text>
                    <Text style={styles.healthNote} numberOfLines={1}>{record.notes}</Text>
                  </View>
                  <Text style={styles.healthDate}>{formatDateShort(record.date)}</Text>
                </View>
              );
            })}
          </View>
        )}
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
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  greeting: { fontSize: font.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontWeight: '500' },
  title: { fontSize: font.xxxl, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },

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
  heroPeriodLabel: { fontSize: font.xs, color: 'rgba(255,255,255,0.6)' },
  heroAvg: { fontSize: font.xl, fontWeight: '800', color: '#fff', marginBottom: spacing.sm },
  heroTotal: { fontSize: font.lg, fontWeight: '700', color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingTop: spacing.xl },

  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  summaryEmoji: { fontSize: 22, marginBottom: 4 },
  summaryValue: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.md,
  },
  emptyEmoji: { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: {
    fontSize: font.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },

  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },

  hatchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  hatchTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
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
    marginBottom: 5,
  },
  progressFill: {
    height: '100%' as any,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
  },
  hatchDue: { fontSize: font.xs, color: colors.textMuted },

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
});
