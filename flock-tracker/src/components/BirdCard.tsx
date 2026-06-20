import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bird } from '../types';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { getAge } from '../utils/helpers';

interface Props {
  bird: Bird;
  onPress: () => void;
  eggCountToday?: number;
}

const SEX_EMOJI: Record<string, string> = { hen: '🐔', rooster: '🐓', unknown: '🐣' };

export default function BirdCard({ bird, onPress, eggCountToday }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatar}>
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
      </View>
      <Text style={styles.name} numberOfLines={1}>{bird.name}</Text>
      <Text style={styles.breed} numberOfLines={1}>{bird.breed}</Text>
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
    ...shadow.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
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
  name: { fontSize: font.md, fontWeight: '700', color: colors.text, textAlign: 'center' },
  breed: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  age: { fontSize: font.xs, color: colors.textSecondary, marginTop: 2 },
  eggBadge: {
    marginTop: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  eggBadgeText: { fontSize: font.xs, color: colors.primaryDark, fontWeight: '700' },
});
