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
          <View>
            <Text style={styles.opponent}>{match.opponentName}</Text>
            <Text style={styles.meta}>
              {match.gameType === 'doubles' && match.partnerName
                ? `w/ ${match.partnerName} · `
                : ''}
              {match.location ?? 'Court'}
            </Text>
          </View>
          <View style={styles.right}>
            <View style={[styles.badge, { backgroundColor: isWin ? colors.winLight : colors.lossLight }]}>
              <Text style={[styles.badgeText, { color: isWin ? colors.win : colors.loss }]}>
                {isWin ? 'WIN' : 'LOSS'}
              </Text>
            </View>
            <Text style={styles.score}>
              {match.myScore} – {match.opponentScore}
            </Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.date}>{formatDateShort(match.date)}</Text>
          <View style={styles.shotRow}>
            {Object.entries(match.shots).map(([key, val]) => (
              <View key={key} style={styles.shotDot}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        colors.ratingColors[Math.round(val) - 1] ?? colors.textMuted,
                      opacity: 0.85,
                    },
                  ]}
                />
              </View>
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
    ...shadow.sm,
  },
  indicator: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  opponent: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  score: {
    fontSize: font.md,
    fontWeight: '600',
    color: colors.text,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: font.sm,
    color: colors.textSecondary,
  },
  shotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  shotDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  avgLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginLeft: 4,
  },
});
