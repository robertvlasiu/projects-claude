import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore, FREE_LIMIT } from '../store';
import { colors, spacing, radius, font } from '../constants/theme';
import MatchCard from '../components/MatchCard';
import { RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

type FilterType = 'all' | 'wins' | 'losses';

export default function MatchesScreen() {
  const navigation = useNavigation<Nav>();
  const { matches, isPremium } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = matches.filter((m) => {
    if (filter === 'wins') return m.isWin;
    if (filter === 'losses') return !m.isWin;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Match History</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('LogMatch', {})}
        >
          <Text style={styles.addBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {(['all', 'wins', 'losses'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>
              {f === 'all' ? 'All' : f === 'wins' ? '✓ Wins' : '✗ Losses'}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{filtered.length} matches</Text>
      </View>

      {!isPremium && matches.length >= FREE_LIMIT && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>
            You've reached the free limit of {FREE_LIMIT} matches.
          </Text>
          <Text style={styles.limitCta}>Upgrade to Premium to log unlimited matches →</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => navigation.navigate('LogMatch', { matchId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏓</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'No matches yet. Go play!' : `No ${filter} to show.`}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.lg,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  pillText: { fontSize: font.sm, color: colors.textSecondary, fontWeight: '500' },
  pillTextActive: { color: colors.primaryDark, fontWeight: '700' },
  count: {
    marginLeft: 'auto',
    fontSize: font.sm,
    color: colors.textMuted,
  },
  limitBanner: {
    backgroundColor: colors.accentLight,
    marginHorizontal: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  limitText: { fontSize: font.sm, color: '#92400E', marginBottom: 2 },
  limitCta: { fontSize: font.sm, fontWeight: '700', color: '#B45309' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: spacing.md },
  emptyText: { fontSize: font.lg, color: colors.textMuted },
});
