import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore, FREE_LIMIT } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { generateId } from '../utils/helpers';
import { Match, ShotRatings, RootStackParamList } from '../types';

type RouteType = RouteProp<RootStackParamList, 'LogMatch'>;

const SHOT_KEYS: (keyof ShotRatings)[] = ['serve', 'return', 'dink', 'drop', 'drive', 'overhead'];
const SHOT_LABELS: Record<keyof ShotRatings, string> = {
  serve: 'Serve',
  return: 'Return',
  dink: 'Dinking',
  drop: 'Drop Shot',
  drive: 'Drives',
  overhead: 'Overhead',
};
const RATING_LABELS = ['', 'Needs Work', 'Developing', 'Solid', 'Strong', 'Elite'];

const defaultShots: ShotRatings = { serve: 3, return: 3, dink: 3, drop: 3, drive: 3, overhead: 3 };

export default function LogMatchScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();
  const { matches, isPremium, addMatch, updateMatch, deleteMatch } = useStore();

  const editMatch = route.params?.matchId
    ? matches.find((m) => m.id === route.params.matchId)
    : null;

  const [opponent, setOpponent] = useState(editMatch?.opponentName ?? '');
  const [partner, setPartner] = useState(editMatch?.partnerName ?? '');
  const [myScore, setMyScore] = useState<number>(editMatch?.myScore ?? 0);
  const [oppScore, setOppScore] = useState<number>(editMatch?.opponentScore ?? 0);
  const [location, setLocation] = useState(editMatch?.location ?? '');
  const [gameType, setGameType] = useState<'singles' | 'doubles'>(editMatch?.gameType ?? 'singles');
  const [notes, setNotes] = useState(editMatch?.notes ?? '');
  const [shots, setShots] = useState<ShotRatings>(editMatch?.shots ?? defaultShots);

  const setRating = (key: keyof ShotRatings, val: number) =>
    setShots((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    if (!opponent.trim()) {
      Alert.alert('Missing info', "Please enter your opponent's name.");
      return;
    }
    const match: Match = {
      id: editMatch?.id ?? generateId(),
      date: editMatch?.date ?? new Date().toISOString(),
      opponentName: opponent.trim(),
      partnerName: partner.trim() || undefined,
      myScore,
      opponentScore: oppScore,
      location: location.trim() || undefined,
      gameType,
      isWin: myScore > oppScore,
      shots,
      notes: notes.trim() || undefined,
    };

    if (editMatch) {
      updateMatch(match);
    } else {
      if (!isPremium && matches.length >= FREE_LIMIT) {
        Alert.alert(
          'Match limit reached',
          `Free accounts store up to ${FREE_LIMIT} matches. Upgrade to Premium to log unlimited matches.`,
          [{ text: 'OK' }]
        );
        return;
      }
      addMatch(match);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Delete Match', 'Remove this match from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteMatch(editMatch!.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const isWon = myScore > oppScore;
  const isTied = myScore === oppScore;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.navBar, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{editMatch ? 'Edit Match' : 'Log Match'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Game type toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Game Type</Text>
          <View style={styles.toggle}>
            {(['singles', 'doubles'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, gameType === type && styles.toggleBtnActive]}
                onPress={() => setGameType(type)}
              >
                <Text style={[styles.toggleText, gameType === type && styles.toggleTextActive]}>
                  {type === 'singles' ? '🎯 Singles' : '👥 Doubles'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Opponent & partner */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Opponent *</Text>
          <TextInput
            style={styles.input}
            placeholder="Their name"
            placeholderTextColor={colors.textMuted}
            value={opponent}
            onChangeText={setOpponent}
          />
          {gameType === 'doubles' && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Your Partner</Text>
              <TextInput
                style={styles.input}
                placeholder="Partner's name"
                placeholderTextColor={colors.textMuted}
                value={partner}
                onChangeText={setPartner}
              />
            </>
          )}
        </View>

        {/* Score — stepper buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Score</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scorePlayerLabel}>You</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setMyScore((s) => Math.max(0, s - 1))}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.stepValue, isWon && { color: colors.win }]}>{myScore}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setMyScore((s) => Math.min(99, s + 1))}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.scoreDash}>–</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scorePlayerLabel}>Them</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setOppScore((s) => Math.max(0, s - 1))}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.stepValue, !isWon && !isTied && { color: colors.loss }]}>{oppScore}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setOppScore((s) => Math.min(99, s + 1))}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={[
            styles.resultBadge,
            { backgroundColor: isWon ? colors.winLight : isTied ? colors.background : colors.lossLight },
          ]}>
            <Text style={[styles.resultText, { color: isWon ? colors.win : isTied ? colors.textMuted : colors.loss }]}>
              {isWon ? '🏆 You won!' : isTied ? '🤝 Tied' : '💪 Keep grinding'}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Court name or park"
            placeholderTextColor={colors.textMuted}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Shot ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Rate Your Shots</Text>
          <Text style={styles.sectionHint}>How did each part of your game feel today?</Text>
          {SHOT_KEYS.map((key, idx) => (
            <View
              key={key}
              style={[
                styles.shotRow,
                idx < SHOT_KEYS.length - 1 && styles.shotRowBorder,
              ]}
            >
              <View style={styles.shotLabelCol}>
                <Text style={styles.shotLabel}>{SHOT_LABELS[key]}</Text>
                <Text style={[styles.shotRatingLabel, { color: colors.ratingColors[shots[key] - 1] }]}>
                  {RATING_LABELS[shots[key]]}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const selected = shots[key] === n;
                  return (
                    <TouchableOpacity
                      key={n}
                      style={[
                        styles.ratingCircle,
                        selected && {
                          backgroundColor: colors.ratingColors[n - 1],
                          borderColor: colors.ratingColors[n - 1],
                        },
                      ]}
                      onPress={() => setRating(key, n)}
                    >
                      <Text style={[styles.ratingNum, selected && styles.ratingNumSelected]}>
                        {n}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="What worked? What didn't? Key moments..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {editMatch && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Match</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { fontSize: font.md, color: colors.textSecondary },
  navTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  save: { fontSize: font.md, color: colors.primary, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: spacing.xl },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  sectionLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: -4,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  toggleBtnActive: { backgroundColor: colors.surface, ...shadow.sm },
  toggleText: { fontSize: font.md, color: colors.textMuted, fontWeight: '500' },
  toggleTextActive: { color: colors.text, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: font.md,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
  },
  notesInput: {
    height: 90,
    paddingTop: spacing.sm + 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  scoreBox: { alignItems: 'center' },
  scorePlayerLabel: {
    fontSize: font.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    gap: 2,
  },
  stepBtn: {
    width: 44,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnText: { fontSize: 26, color: colors.textSecondary, fontWeight: '300', lineHeight: 30 },
  stepValue: {
    fontSize: font.xxxl,
    fontWeight: '800',
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
    letterSpacing: -1,
  },
  scoreDash: { fontSize: font.xxl, color: colors.textMuted, marginTop: 22 },
  resultBadge: {
    borderRadius: radius.full,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  resultText: { fontSize: font.md, fontWeight: '700' },
  shotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  shotRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shotLabelCol: { flex: 1, marginRight: spacing.sm },
  shotLabel: { fontSize: font.md, color: colors.text, fontWeight: '600' },
  shotRatingLabel: { fontSize: font.xs, fontWeight: '600', marginTop: 2 },
  ratingRow: { flexDirection: 'row', gap: 5 },
  ratingCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ratingNum: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600' },
  ratingNumSelected: { color: '#fff', fontWeight: '800' },
  deleteBtn: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  deleteBtnText: { color: colors.error, fontWeight: '700', fontSize: font.md },
});
