import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bird } from '../types';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { getAge } from '../utils/helpers';

interface Props {
  bird: Bird;
  onPress: () => void;
  eggCountToday?: number;
  lastHealthType?: string;
}

const SEX_EMOJI: Record<string, string> = { hen: '🐔', rooster: '🐓', unknown: '🐣' };
const SEX_BG: Record<string, string> = {
  hen: '#FEF3C7',
  rooster: '#CFFAFE',
  unknown: '#F1F5F9',
};
const SEX_LABEL: Record<string, string> = { hen: 'Hen', rooster: 'Rooster', unknown: 'Unknown' };

const HEALTH_DOT: Record<string, string> = {
  illness: colors.error,
  treatment: '#2563EB',
  checkup: '#16A34A',
  observation: '#7C3AED',
  death: '#6B7280',
};

export default function BirdCard({ bird, onPress, eggCountToday, lastHealthType }: Props) {
  const avatarBg = SEX_BG[bird.sex] ?? '#F1F5F9';
  const healthColor = lastHealthType ? HEALTH_DOT[lastHealthType] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        {bird.photo ? (
          <Image source={{ uri: bird.photo }} style={styles.photo} />
        ) : (
          <Text style={styles.emoji}>{SEX_EMOJI[bird.sex]}</Text>
        )}
        {!bird.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>inactive</Text>
          </View>
        )}
        {healthColor && (
          <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{bird.name}</Text>
      {bird.breed ? (
        <View style={styles.breedPill}>
          <Text style={styles.breedText} numberOfLines={1}>{bird.breed}</Text>
        </View>
      ) : null}
      <Text style={styles.sexLabel}>{SEX_LABEL[bird.sex]}</Text>
      {bird.hatchDate ? (
        <Text style={styles.age}>{getAge(bird.hatchDate)} old</Text>
      ) : null}
      {eggCountToday !== undefined && bird.sex === 'hen' && bird.isActive ? (
        <View style={styles.eggBadge}>
          <Text style={styles.eggBadgeText}>🥚 {eggCountToday > 0 ? eggCountToday : '–'}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  emoji: { fontSize: 36 },
  inactiveBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  inactiveBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  healthDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: { fontSize: font.md, fontWeight: '700', color: colors.text, textAlign: 'center' },
  breedPill: {
    marginTop: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    maxWidth: '90%',
  },
  breedText: { fontSize: 10, color: colors.primaryDark, fontWeight: '600', textAlign: 'center' },
  sexLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  age: { fontSize: font.xs, color: colors.textSecondary, marginTop: 1 },
  eggBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  eggBadgeText: { fontSize: font.xs, color: colors.primaryDark, fontWeight: '700' },
});
