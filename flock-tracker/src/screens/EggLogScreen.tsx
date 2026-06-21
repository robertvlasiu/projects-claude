import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import {
  toDateKey,
  getLast30DaysKeys,
  getEggStatsForPeriod,
  formatDateShort,
  generateId,
  getEggStreak,
} from '../utils/helpers';

export default function EggLogScreen() {
  const { eggLogs, birds, addEggLog, deleteEggLog } = useStore();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(toDateKey());
  const [inputCount, setInputCount] = useState('');

  const activeHens = birds.filter((b) => b.isActive && b.sex === 'hen').length;
  const todayLog = eggLogs.find((l) => l.date === selectedDate);
  const stats7 = getEggStatsForPeriod(eggLogs, 7);
  const stats30 = getEggStatsForPeriod(eggLogs, 30);
  const streak = getEggStreak(eggLogs);

  const last30 = getLast30DaysKeys();
  const logMap: Record<string, number> = {};
  eggLogs.forEach((l) => { logMap[l.date] = l.count; });

  const handleQuickLog = (count: number) => {
    addEggLog({
      id: todayLog?.id ?? generateId(),
      date: selectedDate,
      count,
    });
    setInputCount('');
  };

  const handleCustomLog = () => {
    const n = parseInt(inputCount);
    if (isNaN(n) || n < 0) return;
    handleQuickLog(n);
  };

  const handleDelete = () => {
    if (todayLog) deleteEggLog(todayLog.id);
  };

  const maxCount = Object.values(logMap).reduce((m, v) => Math.max(m, v), Math.max(activeHens, 1));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Egg Log</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {streak > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakBannerText}>🔥 {streak}-day logging streak! Keep it going.</Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: '7-day avg', value: `${stats7.daily}/day` },
            { label: '7-day total', value: stats7.total },
            { label: '30-day total', value: stats30.total },
            { label: 'Best day', value: stats30.best },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* 30-day mini chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Last 30 Days</Text>
            {maxCount > 0 && (
              <Text style={styles.chartPeak}>Peak: {maxCount} 🥚</Text>
            )}
          </View>
          <View style={styles.chartArea}>
            {/* Horizontal grid lines */}
            {[0.5, 1].map((frac) => (
              <View
                key={frac}
                style={[styles.gridLine, { bottom: frac * 80 }]}
              />
            ))}
            <View style={styles.chart}>
              {last30.map((date) => {
                const count = logMap[date] ?? 0;
                const height = Math.max((count / maxCount) * 80, count > 0 ? 5 : 2);
                const isSelected = date === selectedDate;
                return (
                  <TouchableOpacity
                    key={date}
                    style={styles.barWrapper}
                    onPress={() => setSelectedDate(date)}
                  >
                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                          backgroundColor: isSelected
                            ? colors.primary
                            : count > 0
                            ? colors.primaryMid + '70'
                            : colors.border,
                          borderRadius: isSelected ? 3 : 2,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>30 days ago</Text>
            <Text style={[styles.chartLabel, { color: colors.primary, fontWeight: '600' }]}>Today</Text>
          </View>
        </View>

        {/* Selected day logger */}
        <View style={styles.logCard}>
          <View style={styles.logCardHeader}>
            <Text style={styles.logCardTitle}>
              {selectedDate === toDateKey() ? 'Today' : formatDateShort(selectedDate)}
            </Text>
            {todayLog && (
              <TouchableOpacity onPress={handleDelete}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.currentCount}>
            <Text style={styles.currentCountNumber}>{todayLog?.count ?? '—'}</Text>
            <Text style={styles.currentCountLabel}>eggs collected</Text>
          </View>

          {/* Quick tap buttons */}
          <Text style={styles.quickLabel}>Quick log</Text>
          <View style={styles.quickRow}>
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.quickBtn, todayLog?.count === n && styles.quickBtnActive]}
                onPress={() => handleQuickLog(n)}
              >
                <Text style={[styles.quickBtnText, todayLog?.count === n && styles.quickBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom number input */}
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Custom count"
              placeholderTextColor={colors.textMuted}
              value={inputCount}
              onChangeText={setInputCount}
              keyboardType="number-pad"
              maxLength={3}
            />
            <TouchableOpacity style={styles.customBtn} onPress={handleCustomLog}>
              <Text style={styles.customBtnText}>Log</Text>
            </TouchableOpacity>
          </View>

          {activeHens > 0 && todayLog ? (
            <Text style={styles.layingRateText}>
              {Math.round((todayLog.count / activeHens) * 100)}% of your {activeHens} hen{activeHens !== 1 ? 's' : ''} laid today
            </Text>
          ) : null}
        </View>

        {/* Recent logs list */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {eggLogs.slice(0, 14).map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logDate}>{formatDateShort(log.date)}</Text>
              <View style={styles.logBarContainer}>
                <View
                  style={[
                    styles.logBarFill,
                    { width: `${Math.min((log.count / maxCount) * 100, 100)}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.logCount}>{log.count} 🥚</Text>
            </View>
          ))}
          {eggLogs.length === 0 && (
            <Text style={styles.emptyText}>No egg logs yet. Tap a number above to log today's collection.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  content: { padding: spacing.xl, paddingTop: spacing.xs },
  streakBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  streakBannerText: { fontSize: font.sm, fontWeight: '700', color: colors.primaryDark },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadow.sm,
  },
  statValue: { fontSize: font.lg, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  chartPeak: { fontSize: font.xs, color: colors.primaryDark, fontWeight: '600' },
  chartArea: {
    position: 'relative',
    height: 88,
    justifyContent: 'flex-end',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  barWrapper: { flex: 1, justifyContent: 'flex-end', height: 80 },
  bar: { minHeight: 2 },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  chartLabel: { fontSize: 10, color: colors.textMuted },
  logCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  logCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logCardTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  clearText: { fontSize: font.sm, color: colors.error, fontWeight: '600' },
  currentCount: { alignItems: 'center', marginBottom: spacing.lg },
  currentCountNumber: { fontSize: 72, fontWeight: '800', color: colors.primary, lineHeight: 80 },
  currentCountLabel: { fontSize: font.md, color: colors.textMuted },
  quickLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  quickBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  quickBtnText: { fontSize: font.md, fontWeight: '700', color: colors.textSecondary },
  quickBtnTextActive: { color: '#fff' },
  customRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: font.md,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
  },
  customBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  customBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },
  layingRateText: { fontSize: font.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  recentSection: { marginTop: spacing.sm },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
    ...shadow.sm,
  },
  logDate: { fontSize: font.sm, color: colors.textSecondary, width: 52 },
  logBarContainer: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden' },
  logBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  logCount: { fontSize: font.sm, fontWeight: '700', color: colors.text, width: 44, textAlign: 'right' },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
