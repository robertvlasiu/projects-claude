import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { toDateKey, getEggStatsForPeriod, formatDateShort } from '../utils/helpers';
import { RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { birds, eggLogs, healthRecords, hatchBatches } = useStore();

  const today = toDateKey();
  const todayLog = eggLogs.find((l) => l.date === today);
  const todayCount = todayLog?.count ?? 0;

  const activeHens = birds.filter((b) => b.isActive && b.sex === 'hen').length;
  const activeRoosters = birds.filter((b) => b.isActive && b.sex === 'rooster').length;

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
      <View style={styles.header}>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Today's eggs — hero card */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroEmoji}>🥚</Text>
            <View>
              <Text style={styles.heroLabel}>Today's Eggs</Text>
              <Text style={styles.heroCount}>{todayCount}</Text>
              <Text style={styles.heroSub}>
                {activeHens} hen{activeHens !== 1 ? 's' : ''} · {layingRate}% laying rate
              </Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroPeriod}>7-day avg</Text>
            <Text style={styles.heroAvg}>{stats7.daily}/day</Text>
          </View>
        </TouchableOpacity>

        {/* Flock summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{birds.filter(b => b.isActive).length}</Text>
            <Text style={styles.summaryLabel}>Active Birds</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeHens}</Text>
            <Text style={styles.summaryLabel}>Hens 🐔</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats30.total}</Text>
            <Text style={styles.summaryLabel}>Eggs (30d)</Text>
          </View>
        </View>

        {/* Empty state */}
        {birds.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐔</Text>
            <Text style={styles.emptyTitle}>Add your first bird</Text>
            <Text style={styles.emptyText}>
              Track each hen's production, health records, and more. Your flock deserves good records.
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
              const totalDays = (expected.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
              const progress = Math.min(elapsed / totalDays, 1);
              const daysLeft = Math.max(0, Math.ceil((expected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <View key={batch.id} style={styles.hatchCard}>
                  <View style={styles.hatchTop}>
                    <Text style={styles.hatchName}>{batch.name}</Text>
                    <Text style={styles.hatchDays}>{daysLeft}d left</Text>
                  </View>
                  <Text style={styles.hatchMeta}>{batch.eggsSet} eggs · {batch.breed ?? 'Mixed'}</Text>
                  <View style={styles.hatchProgressBg}>
                    <View style={[styles.hatchProgressFill, { width: `${progress * 100}%` as any }]} />
                  </View>
                  <Text style={styles.hatchDue}>Expected: {formatDateShort(batch.expectedHatchDate)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent health */}
        {recentHealth.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Health Events</Text>
            {recentHealth.map((record) => {
              const bird = birds.find((b) => b.id === record.birdId);
              return (
                <View key={record.id} style={styles.healthRow}>
                  <View
                    style={[
                      styles.healthDot,
                      { backgroundColor: colors.healthColors[record.type] ?? colors.textMuted },
                    ]}
                  />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.lg,
  },
  greeting: { fontSize: font.sm, color: colors.textMuted, marginBottom: 2 },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    ...shadow.sm,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  content: { padding: spacing.xl, paddingTop: spacing.xs },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  heroEmoji: { fontSize: 44 },
  heroLabel: { fontSize: font.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  heroCount: { fontSize: 52, fontWeight: '800', color: '#fff', lineHeight: 56 },
  heroSub: { fontSize: font.xs, color: 'rgba(255,255,255,0.7)' },
  heroRight: { alignItems: 'flex-end' },
  heroPeriod: { fontSize: font.xs, color: 'rgba(255,255,255,0.7)' },
  heroAvg: { fontSize: font.xl, fontWeight: '800', color: '#fff' },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  summaryValue: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    ...shadow.sm,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
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
  },
  hatchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  hatchTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  hatchName: { fontSize: font.md, fontWeight: '700', color: colors.text },
  hatchDays: { fontSize: font.md, fontWeight: '700', color: colors.primary },
  hatchMeta: { fontSize: font.sm, color: colors.textMuted, marginBottom: spacing.sm },
  hatchProgressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  hatchProgressFill: {
    height: '100%',
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
    ...shadow.sm,
  },
  healthDot: { width: 10, height: 10, borderRadius: 5 },
  healthInfo: { flex: 1 },
  healthBird: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  healthNote: { fontSize: font.xs, color: colors.textMuted },
  healthDate: { fontSize: font.xs, color: colors.textMuted },
});
