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
import { Match, ShotRatings } from '../types';

const SHOT_LABELS: Record<keyof ShotRatings, string> = {
  serve: 'Serve',
  return: 'Return',
  dink: 'Dinking',
  drop: 'Drop Shot',
  drive: 'Drives',
  overhead: 'Overhead',
};

const SHOT_ICONS: Record<keyof ShotRatings, string> = {
  serve: '🎾',
  return: '↩️',
  dink: '🤲',
  drop: '🪂',
  drive: '⚡',
  overhead: '💥',
};

const SHOT_ANALYSIS: Record<keyof ShotRatings, { what: string; low: string; mid: string; high: string }> = {
  serve: {
    what: 'The serve starts every rally. In pickleball, the goal is a deep, low serve that keeps opponents behind the baseline and makes their return harder.',
    low: 'Frequent faults or short serves — opponents are getting easy pop-up returns. Focus on toss consistency and smooth follow-through.',
    mid: 'Getting the ball in consistently. Now work on depth and placement — target the backhand corner or the body.',
    high: 'Placing serves deep to both corners, varying spin and pace to keep opponents guessing.',
  },
  return: {
    what: 'A deep return of serve forces the serving team to hit a third shot from far back, giving you time to rush the kitchen line.',
    low: 'Returns are landing short, letting servers drive at you. Try to make contact early and punch through the ball.',
    mid: 'Getting returns in. Next level: go deeper and move to the kitchen line immediately after every return.',
    high: 'Consistently returning deep and transitioning to the kitchen — you\'re taking time away from the serving team.',
  },
  dink: {
    what: 'Dinking is the heart of pickleball. Soft, arcing shots into the kitchen force opponents into unattackable positions and set up your winning shot.',
    low: 'Dinks are going into the net or popping up too high. Stay low, soften your grip, and aim 6–12 inches over the net.',
    mid: 'Keeping rallies alive. Work on directional control — cross-court and down-the-line — and resist the urge to speed up too early.',
    high: 'Moving opponents with placement, varying pace and spin, and patiently waiting for the right ball to attack.',
  },
  drop: {
    what: 'The third shot drop is the most important transition shot. A soft drop from the baseline into the kitchen neutralizes the serving team\'s advantage.',
    low: 'Drops are hitting the net or landing too short. Use an upward scooping motion — contact the ball low and let it arc over.',
    mid: 'Getting drops into the kitchen sometimes. Aim for consistency: 7 of 10 in the NVZ before focusing on spin or pace.',
    high: 'Landing drops softly in the kitchen and using them to safely advance to the net every time.',
  },
  drive: {
    what: 'Drives are flat, fast groundstrokes meant to pressure opponents. Best used when the ball is above net height or opponents are out of position.',
    low: 'Drives are going wide or into the net. Keep your paddle face slightly open and drive through the ball — don\'t flick.',
    mid: 'Getting drives in play. Now work on targets: aim at the opponent\'s feet or hips, not center court.',
    high: 'Choosing when to drive vs. drop based on ball height, consistently targeting opponents\' weak spots.',
  },
  overhead: {
    what: 'The overhead puts away lobs. The key is reading the lob early, getting behind the ball quickly, and punching — not swinging — for control.',
    low: 'Overheads are going out or into the net. Turn sideways as soon as you see the lob and get behind it before striking.',
    mid: 'Making overheads when set up well. Work on cutting off lobs earlier and aiming to open court rather than straight at opponents.',
    high: 'Tracking lobs quickly, closing space, and putting away overheads consistently into the corners.',
  },
};

const RATING_GUIDE = [
  { level: '1 — Needs Work', color: colors.ratingColors[0], desc: 'Frequent errors, still building the fundamentals of this shot.' },
  { level: '2 — Developing', color: colors.ratingColors[1], desc: 'Inconsistent — the shot works sometimes but not reliably under pressure.' },
  { level: '3 — Solid', color: colors.ratingColors[2], desc: 'Reliable in normal play. You\'re ready for competitive play or tournaments.' },
  { level: '4 — Strong', color: colors.ratingColors[3], desc: 'Consistent even under pressure. This shot is a real weapon in your game.' },
  { level: '5 — Elite', color: colors.ratingColors[4], desc: 'Tournament-level. Opponents actively look to avoid this shot.' },
];

type Period = '5' | '10' | 'all';

function computeBestWinStreak(matches: Match[]): number {
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0, cur = 0;
  for (const m of sorted) {
    if (m.isWin) { cur++; best = Math.max(best, cur); } else { cur = 0; }
  }
  return best;
}

function computeBestMatchRating(matches: Match[]): number {
  if (!matches.length) return 0;
  return Math.max(
    ...matches.map((m) => {
      const vals = Object.values(m.shots) as number[];
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    })
  );
}

function computeBestMonth(matches: Match[]): { label: string; wins: number; total: number } | null {
  if (!matches.length) return null;
  const byMonth: Record<string, { wins: number; total: number }> = {};
  for (const m of matches) {
    const key = m.date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { wins: 0, total: 0 };
    byMonth[key].total++;
    if (m.isWin) byMonth[key].wins++;
  }
  const best = Object.entries(byMonth).sort((a, b) => b[1].wins - a[1].wins)[0];
  if (!best) return null;
  const [year, month] = best[0].split('-');
  const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return { label, wins: best[1].wins, total: best[1].total };
}

export default function SkillsScreen() {
  const insets = useSafeAreaInsets();
  const { matches } = useStore();
  const [period, setPeriod] = useState<Period>('10');
  const [showGuide, setShowGuide] = useState(false);
  const [expandedShot, setExpandedShot] = useState<keyof ShotRatings | null>(null);

  const periodMatches = period === 'all' ? matches : matches.slice(0, parseInt(period));
  const avg = getAverageShots(periodMatches);

  const weakest = (Object.entries(avg) as [keyof ShotRatings, number][]).sort((a, b) => a[1] - b[1])[0];
  const strongest = (Object.entries(avg) as [keyof ShotRatings, number][]).sort((a, b) => b[1] - a[1])[0];
  const overallAvg = Object.values(avg).reduce((a, b) => a + b, 0) / Object.values(avg).length;

  const overallLabel =
    overallAvg >= 4.5 ? 'Elite' :
    overallAvg >= 3.5 ? 'Strong' :
    overallAvg >= 2.5 ? 'Solid' :
    overallAvg >= 1.5 ? 'Developing' : 'Needs Work';

  const bestWinStreak = computeBestWinStreak(matches);
  const bestMatchRating = computeBestMatchRating(matches);
  const bestMonth = computeBestMonth(matches);

  const getShotAnalysisText = (key: keyof ShotRatings, val: number): string => {
    const analysis = SHOT_ANALYSIS[key];
    if (val <= 1.5) return analysis.low;
    if (val <= 3.0) return analysis.mid;
    return analysis.high;
  };

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
            <Text style={styles.emptyTitle}>No skill data yet</Text>
            <Text style={styles.emptyText}>
              Log a match and rate your shots to see your skill breakdown here.
            </Text>
            <View style={styles.ratingHintCard}>
              <Text style={styles.ratingHintTitle}>How ratings work</Text>
              {RATING_GUIDE.map((g) => (
                <View key={g.level} style={styles.ratingHintRow}>
                  <View style={[styles.ratingHintDot, { backgroundColor: g.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ratingHintLevel}>{g.level}</Text>
                    <Text style={styles.ratingHintDesc}>{g.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Overall score */}
            <View style={styles.overallCard}>
              <Text style={styles.overallScore}>{overallAvg.toFixed(1)}</Text>
              <Text style={styles.overallLabel}>{overallLabel}</Text>
              <View style={styles.overallSegments}>
                {[1, 2, 3, 4, 5].map((seg) => (
                  <View
                    key={seg}
                    style={[styles.overallSegment, { opacity: overallAvg >= seg - 0.5 ? 1 : 0.25 }]}
                  />
                ))}
              </View>
              <Text style={styles.overallSub}>
                Based on {periodMatches.length} match{periodMatches.length !== 1 ? 'es' : ''}
              </Text>
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

            {/* Shot breakdown — each bar is tappable to expand analysis */}
            <View style={styles.barsCard}>
              <Text style={styles.cardTitle}>Shot Breakdown</Text>
              <Text style={styles.cardSubtitle}>Tap any shot to see what your rating means</Text>
              {(Object.keys(avg) as (keyof ShotRatings)[]).map((key) => (
                <View key={key}>
                  <TouchableOpacity
                    onPress={() => setExpandedShot(expandedShot === key ? null : key)}
                    activeOpacity={0.7}
                    style={styles.shotRow}
                  >
                    <View style={styles.shotLabelRow}>
                      <Text style={styles.shotIcon}>{SHOT_ICONS[key]}</Text>
                      <View style={{ flex: 1 }}>
                        <SkillBar label={SHOT_LABELS[key]} value={avg[key]} />
                      </View>
                      <Text style={styles.expandChevron}>{expandedShot === key ? '▲' : '▼'}</Text>
                    </View>
                    {expandedShot === key && (
                      <View style={styles.analysisBox}>
                        <Text style={styles.analysisWhat}>{SHOT_ANALYSIS[key].what}</Text>
                        <View style={styles.analysisDivider} />
                        <View style={styles.analysisRatingRow}>
                          <View style={[styles.analysisBadge, { backgroundColor: colors.ratingColors[Math.round(avg[key]) - 1] }]}>
                            <Text style={styles.analysisBadgeText}>{avg[key].toFixed(1)}</Text>
                          </View>
                          <Text style={styles.analysisText}>{getShotAnalysisText(key, avg[key])}</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Rating guide (collapsible) */}
            <TouchableOpacity
              style={styles.guideToggle}
              onPress={() => setShowGuide((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.guideToggleText}>❓ What do the ratings mean?</Text>
              <Text style={styles.guideToggleChevron}>{showGuide ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showGuide && (
              <View style={styles.guideCard}>
                {RATING_GUIDE.map((g) => (
                  <View key={g.level} style={styles.guideRow}>
                    <View style={[styles.guideDot, { backgroundColor: g.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.guideLevel}>{g.level}</Text>
                      <Text style={styles.guideDesc}>{g.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Personal Records */}
            <View style={styles.recordsCard}>
              <Text style={styles.cardTitle}>Personal Records</Text>
              <View style={styles.recordsGrid}>
                <View style={styles.recordItem}>
                  <Text style={styles.recordEmoji}>🔥</Text>
                  <Text style={styles.recordValue}>{bestWinStreak}</Text>
                  <Text style={styles.recordLabel}>Best Win Streak</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordEmoji}>⭐</Text>
                  <Text style={styles.recordValue}>{bestMatchRating > 0 ? bestMatchRating.toFixed(1) : '—'}</Text>
                  <Text style={styles.recordLabel}>Best Match Rating</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordEmoji}>📅</Text>
                  <Text style={styles.recordValue}>{bestMonth ? `${bestMonth.wins}W` : '—'}</Text>
                  <Text style={styles.recordLabel}>{bestMonth ? `Best Month (${bestMonth.label})` : 'Best Month'}</Text>
                </View>
                <View style={styles.recordItem}>
                  <Text style={styles.recordEmoji}>🏓</Text>
                  <Text style={styles.recordValue}>{matches.length}</Text>
                  <Text style={styles.recordLabel}>Total Matches</Text>
                </View>
              </View>
            </View>

            <View style={{ height: spacing.xxxl }} />
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
  periodRow: { flexDirection: 'row', gap: spacing.xs },
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
    backgroundColor: colors.headerBg,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  overallScore: { fontSize: 72, fontWeight: '800', color: '#fff', letterSpacing: -2, lineHeight: 78 },
  overallLabel: { fontSize: font.xl, fontWeight: '700', color: '#fff', opacity: 0.95, marginTop: 2 },
  overallSegments: { flexDirection: 'row', gap: 6, marginTop: spacing.md, marginBottom: spacing.sm },
  overallSegment: { width: 44, height: 6, borderRadius: radius.full, backgroundColor: '#fff' },
  overallSub: { fontSize: font.sm, color: '#fff', opacity: 0.65 },
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
  cardTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: font.xs, color: colors.textMuted, marginBottom: spacing.lg },
  shotRow: { marginBottom: spacing.xs },
  shotLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shotIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  expandChevron: { fontSize: 10, color: colors.textMuted, marginLeft: spacing.xs },
  analysisBox: {
    marginTop: spacing.sm,
    marginLeft: 26 + spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analysisWhat: {
    fontSize: font.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  analysisDivider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.sm },
  analysisRatingRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  analysisBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  analysisBadgeText: { fontSize: font.sm, fontWeight: '800', color: '#fff' },
  analysisText: { flex: 1, fontSize: font.sm, color: colors.text, lineHeight: 20 },
  guideToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guideToggleText: { fontSize: font.md, fontWeight: '600', color: colors.text },
  guideToggleChevron: { fontSize: 10, color: colors.textMuted },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  guideRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  guideDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3, flexShrink: 0 },
  guideLevel: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  guideDesc: { fontSize: font.sm, color: colors.textSecondary, lineHeight: 19 },
  recordsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  recordsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  recordItem: {
    width: '46%',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordEmoji: { fontSize: 28, marginBottom: spacing.xs },
  recordValue: { fontSize: font.xl, fontWeight: '800', color: colors.primary, marginBottom: 2 },
  recordLabel: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center', fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: font.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  ratingHintCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  ratingHintTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  ratingHintRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  ratingHintDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3, flexShrink: 0 },
  ratingHintLevel: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  ratingHintDesc: { fontSize: font.sm, color: colors.textSecondary, lineHeight: 19 },
});
