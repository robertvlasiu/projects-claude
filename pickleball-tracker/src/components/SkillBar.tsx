import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, radius, font } from '../constants/theme';

interface Props {
  label: string;
  value: number;
  maxValue?: number;
}

const RATING_LABELS = ['', 'Needs Work', 'Developing', 'Solid', 'Strong', 'Elite'];

export default function SkillBar({ label, value, maxValue = 5 }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value / maxValue,
      duration: 600,
      useNativeDriver: false,
      delay: 100,
    }).start();
  }, [value]);

  const barColor =
    value >= 4 ? colors.win : value >= 3 ? colors.accent : value >= 2 ? '#F97316' : colors.error;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              width: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        {[1, 2, 3, 4].map((tick) => (
          <View key={tick} style={[styles.tick, { left: `${(tick / maxValue) * 100}%` as any }]} />
        ))}
      </View>
      <View style={styles.meta}>
        <Text style={[styles.value, { color: barColor }]}>{value.toFixed(1)}</Text>
        <Text style={styles.ratingLabel}>{RATING_LABELS[Math.round(value)] ?? ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: {
    width: 72,
    fontSize: font.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'visible',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: radius.full,
  },
  tick: {
    position: 'absolute',
    top: -2,
    width: 1,
    height: 14,
    backgroundColor: colors.background,
  },
  meta: {
    width: 80,
    alignItems: 'flex-end',
  },
  value: {
    fontSize: font.md,
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
});
