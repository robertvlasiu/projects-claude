import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, font, shadow } from '../constants/theme';

interface Props {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
  color?: string;
}

export default function StatCard({ label, value, subtitle, accent, color }: Props) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={[styles.value, { color: color ?? (accent ? colors.primary : colors.text) }]}>
        {value}
      </Text>
      <Text style={[styles.label, accent && styles.labelAccent]}>{label}</Text>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.sm,
  },
  cardAccent: {
    backgroundColor: colors.primaryLight,
  },
  value: {
    fontSize: font.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: font.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelAccent: {
    color: colors.primaryDark,
  },
  subtitle: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
