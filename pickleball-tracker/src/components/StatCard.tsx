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
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.md,
  },
  cardAccent: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryMid,
  },
  value: {
    fontSize: font.xxl,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: font.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
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
