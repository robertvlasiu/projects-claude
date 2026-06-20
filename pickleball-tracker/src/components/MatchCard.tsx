import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Match } from '../types';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { formatDateShort } from '../utils/helpers';

interface Props {
  match: Match;
  onPress: () => void;
  onDelete?: () => void;
}

export default function MatchCard({ match, onPress }: Props) {
  const isWin = match.isWin;
  const avgShot =
    Object.values(match.shots).reduce((a, b) => a + b, 0) /
    Object.values(match.shots).length;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.indicator, { backgroundColor: isWin ? colors.win : colors.loss }]} />
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.left}>
            <Text style={styles.opponent}>{match.opponentName}</Text>
            {match.gameType === 'doubles' && match.partnerName ? (
              <Text style={styles.meta}>w/ {match.partnerName}</Text>
            ) : null}
            <Text style={styles.location}>{match.location ?? 'Court'} · {formatDateShort(match.date)}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.score}>
              {match.myScore}–{match.opponentScore}
            </Text>
            <View style={[styles.badge, { backgroundColor: isWin ? colors.winLight : colors.lossLight }]}>
              <Text style={[styles.badgeText, { color: isWin ? colors.win : colors.loss }]}>
                {isWin ? 'WIN' : 'LOSS'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.bottom}>
          <View style={styles.shotRow}>
            {Object.entries(match.shots).map(([key, val]) => (
              <View
                key={key}
                style={[
                  styles.dot,
                  { backgroundColor: colors.ratingColors[Math.round(val) - 1] ?? colors.textMuted },
                ]}
              />
            ))}
            <Text style={styles.avgLabel}>avg {avgShot.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  indicator: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  left: { flex: 1, marginRight: spacing.md },
  opponent: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  meta: {
    fontSize: font.xs,
    color: colors.textSecondary,
    marginBottom: 1,
  },
  location: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
  },
  score: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  avgLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginLeft: 5,
    fontWeight: '500',
  },
});
