import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import StatCard from '../components/StatCard';
import MatchCard from '../components/MatchCard';
import { getWinRate, getStreakInfo, formatDateShort } from '../utils/helpers';
import { RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { matches } = useStore();

  const winRate = getWinRate(matches);
  const streak = getStreakInfo(matches);
  const recentMatches = matches.slice(0, 5);
  const thisMonth = matches.filter((m) => {
    const d = new Date(m.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 🏓</Text>
          <Text style={styles.title}>Your Pickleball</Text>
        </View>
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() => navigation.navigate('LogMatch', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.logBtnText}>+ Log Match</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            subtitle={`${matches.length} matches`}
            accent
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            label="This Month"
            value={thisMonth.length}
            subtitle={`${thisMonth.filter(m => m.isWin).length}W · ${thisMonth.filter(m => !m.isWin).length}L`}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            label={streak.type === 'win' ? '🔥 Streak' : streak.type === 'loss' ? '❄️ Streak' : 'Streak'}
            value={streak.streak}
            subtitle={streak.type ?? '—'}
            color={streak.type === 'win' ? colors.win : streak.type === 'loss' ? colors.loss : undefined}
          />
        </View>

        {/* Empty state */}
        {matches.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🏓</Text>
            <Text style={styles.emptyTitle}>Log your first match</Text>
            <Text style={styles.emptyText}>
              Track your scores, rate your shots, and watch your game improve over time.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('LogMatch', {})}
            >
              <Text style={styles.emptyBtnText}>Log a Match</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent matches */}
        {recentMatches.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            {recentMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPress={() => navigation.navigate('LogMatch', { matchId: match.id })}
              />
            ))}
          </View>
        )}

        {/* Quick drills CTA */}
        <TouchableOpacity style={styles.drillBanner} activeOpacity={0.85}>
          <View>
            <Text style={styles.drillBannerTitle}>Ready to drill? 💪</Text>
            <Text style={styles.drillBannerSub}>8 focused drills to sharpen your game</Text>
          </View>
          <Text style={styles.drillArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  greeting: { fontSize: font.sm, color: colors.textMuted, marginBottom: 2 },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  logBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    ...shadow.sm,
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingTop: spacing.sm },
  statsRow: { flexDirection: 'row', marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: {
    fontSize: font.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },
  drillBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  drillBannerTitle: { fontSize: font.md, fontWeight: '700', color: '#92400E' },
  drillBannerSub: { fontSize: font.sm, color: '#B45309', marginTop: 2 },
  drillArrow: { fontSize: font.xl, color: '#92400E' },
});
