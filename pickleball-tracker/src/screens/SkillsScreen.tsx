import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import SkillBar from '../components/SkillBar';
import { getAverageShots } from '../utils/helpers';
import { ShotRatings } from '../types';

const SHOT_LABELS: Record<keyof ShotRatings, string> = {
  serve: 'Serve',
  return: 'Return',
  dink: 'Dinking',
  drop: 'Drop Shot',
  drive: 'Drives',
  overhead: 'Overhead',
};

const SHOT_TIPS: Record<keyof ShotRatings, string> = {
  serve: 'Work on depth — deep serves push opponents back from the kitchen.',
  return: 'Return deep and move to the kitchen line immediately.',
  dink: 'Stay low, relax your grip, and aim cross-court by default.',
  drop: 'Practice 50 third-shot drops daily. Aim for the kitchen, not the net tape.',
  drive: 'Keep your paddle up. Drive when the ball is above the net height.',
  overhead: "Read the lob early, get behind it, and punch — don't swing.",
};

type Period = '5' | '10' | 'all';

export default function SkillsScreen() {
  const insets = useSafeAreaInsets();
  const { matches } = useStore();
  const [period, setPeriod] = useState<Period>('10');

  const periodMatches =
    period === 'all' ? matches : matches.slice(0, parseInt(period));

  const avg = getAverageShots(periodMatches);

  const weakest = (Object.entries(avg) as [keyof ShotRatings, number][]).sort(
    (a, b) => a[1] - b[1]
  )[0];

  const strongest = (Object.entries(avg) as [keyof ShotRatings, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const overallAvg =
    Object.values(avg).reduce((a, b) => a + b, 0) / Object.values(avg).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Shot Skills</Text>
        <View style={styles.periodRow}>
          {(['5', '10', 'all'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === 'all' ? 'All time' : `Last ${p}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {matches.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>Log matches and rate your shots to see your skill breakdown here.</Text>
          </View>
        ) : (
          <>
            {/* Overall score */}
            <View style={styles.overallCard}>
              <Text style={styles.overallScore}>{overallAvg.toFixed(1)}</Text>
              <Text style={styles.overallLabel}>Overall Rating</Text>
              <Text style={styles.overallSub}>Based on {periodMatches.length} matches</Text>
            </View>

            {/* Insight cards */}
            {weakest && strongest && (
              <View style={styles.insightRow}>
                <View style={[styles.insightCard, { borderColor: colors.error + '40' }]}>
                  <Text style={styles.insightIcon}>⚠️</Text>
                  <Text style={styles.insightLabel}>Focus On</Text>
                  <Text style={[styles.insightValue, { color: colors.error }]}>
                    {SHOT_LABELS[weakest[0]]}
                  </Text>
                  <Text style={styles.insightScore}>{weakest[1].toFixed(1)}/5</Text>
                </View>
                <View style={[styles.insightCard, { borderColor: colors.win + '40' }]}>
                  <Text style={styles.insightIcon}>🌟</Text>
                  <Text style={styles.insightLabel}>Strongest</Text>
                  <Text style={[styles.insightValue, { color: colors.win }]}>
                    {SHOT_LABELS[strongest[0]]}
                  </Text>
                  <Text style={styles.insightScore}>{strongest[1].toFixed(1)}/5</Text>
                </View>
              </View>
            )}

            {/* Skill bars */}
            <View style={styles.barsCard}>
              <Text style={styles.cardTitle}>Shot Breakdown</Text>
              {(Object.keys(avg) as (keyof ShotRatings)[]).map((key) => (
                <SkillBar key={key} label={SHOT_LABELS[key]} value={avg[key]} />
              ))}
            </View>

            {/* Tip card */}
            {weakest && (
              <View style={styles.tipCard}>
                <Text style={styles.tipHeader}>💡 Drill Tip — {SHOT_LABELS[weakest[0]]}</Text>
                <Text style={styles.tipText}>{SHOT_TIPS[weakest[0]]}</Text>
              </View>
            )}
          </>
        )}
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
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  periodText: { fontSize: font.sm, color: colors.textSecondary, fontWeight: '500' },
  periodTextActive: { color: colors.primaryDark, fontWeight: '700' },
  content: { padding: spacing.xl, paddingTop: spacing.sm },
  overallCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overallScore: { fontSize: 56, fontWeight: '800', color: '#fff' },
  overallLabel: { fontSize: font.lg, fontWeight: '600', color: '#fff', opacity: 0.9 },
  overallSub: { fontSize: font.sm, color: '#fff', opacity: 0.7, marginTop: 4 },
  insightRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  insightCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    ...shadow.sm,
  },
  insightIcon: { fontSize: 24, marginBottom: 4 },
  insightLabel: { fontSize: font.xs, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  insightValue: { fontSize: font.lg, fontWeight: '800', marginTop: 2 },
  insightScore: { fontSize: font.sm, color: colors.textSecondary },
  barsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tipCard: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipHeader: { fontSize: font.md, fontWeight: '700', color: '#92400E', marginBottom: spacing.xs },
  tipText: { fontSize: font.md, color: '#78350F', lineHeight: 22 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: font.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
