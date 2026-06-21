import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import StatCard from '../components/StatCard';
import MatchCard from '../components/MatchCard';
import { getWinRate, getStreakInfo } from '../utils/helpers';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { matches } = useStore();

  const winRate = getWinRate(matches);
  const streak = getStreakInfo(matches);
  const recentMatches = matches.slice(0, 5);
  const thisMonth = matches.filter((m) => {
    const d = new Date(m.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthW = thisMonth.filter((m) => m.isWin).length;
  const thisMonthL = thisMonth.filter((m) => !m.isWin).length;

  return (
    <View style={styles.container}>
      {/* Colored header band */}
      <View style={[styles.headerBand, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
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

        {/* Stats row overlapping the band */}
        <View style={styles.statsRow}>
          <StatCard label="Win Rate" value={`${winRate}%`} subtitle={`${matches.length} matches`} accent />
          <StatCard
            label="This Month"
            value={thisMonth.length}
            subtitle={`${thisMonthW}W · ${thisMonthL}L`}
          />
          <StatCard
            label={streak.type === 'win' ? '🔥 Streak' : streak.type === 'loss' ? '❄️ Streak' : 'Streak'}
            value={streak.streak}
            subtitle={streak.type ?? '—'}
            color={streak.type === 'win' ? colors.win : streak.type === 'loss' ? colors.loss : undefined}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty state */}
        {matches.length === 0 && (
          <>
            <TouchableOpacity
              style={styles.firstMatchCta}
              onPress={() => navigation.navigate('LogMatch', {})}
              activeOpacity={0.85}
            >
              <Text style={styles.firstMatchEmoji}>🏓</Text>
              <View style={styles.firstMatchText}>
                <Text style={styles.firstMatchTitle}>Log Your First Match</Text>
                <Text style={styles.firstMatchSub}>Takes less than 60 seconds →</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.howItWorksTitle}>How it works</Text>

            {[
              {
                emoji: '📋',
                title: 'Log a match',
                desc: 'Score, opponent, location, and rate your 6 shots (serve, return, dink, drop, drive, overhead) after each game.',
              },
              {
                emoji: '📊',
                title: 'See your skill report',
                desc: 'After 3+ matches your Shot Skills screen shows your strongest and weakest shots with color-coded bars.',
              },
              {
                emoji: '⏱',
                title: 'Drill the weak spots',
                desc: '8 focused drills with a built-in countdown timer. Finish a drill and it\'s logged automatically.',
              },
            ].map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{f.emoji}</Text>
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Pro tip</Text>
              <Text style={styles.tipText}>
                Rate your shots 1–5 after every match. In just 5 matches, you'll see a full breakdown of where your game needs work.
              </Text>
            </View>
          </>
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

        {/* Drill CTA */}
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

  headerBand: {
    backgroundColor: colors.headerBg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl + spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  greeting: { fontSize: font.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontWeight: '500' },
  title: { fontSize: font.xxxl, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

  logBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  logBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: -spacing.sm,
  },

  scroll: { flex: 1, marginTop: -spacing.xl },
  scrollContent: { padding: spacing.xl, paddingTop: spacing.xxl + spacing.md },

  sectionTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },

  firstMatchCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
    ...shadow.md,
  },
  firstMatchEmoji: { fontSize: 36 },
  firstMatchText: { flex: 1 },
  firstMatchTitle: { fontSize: font.lg, fontWeight: '800', color: '#fff' },
  firstMatchSub: { fontSize: font.sm, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  howItWorksTitle: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureEmoji: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: 3 },
  featureDesc: { fontSize: font.sm, color: colors.textSecondary, lineHeight: 20 },
  tipCard: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipTitle: { fontSize: font.sm, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  tipText: { fontSize: font.sm, color: '#78350F', lineHeight: 20 },

  drillBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  drillBannerTitle: { fontSize: font.md, fontWeight: '700', color: '#92400E' },
  drillBannerSub: { fontSize: font.sm, color: '#B45309', marginTop: 3 },
  drillArrow: { fontSize: font.xl, color: '#92400E' },
});
