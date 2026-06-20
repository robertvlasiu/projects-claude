import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Vibration,
} from 'react-native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { BUILT_IN_DRILLS } from '../constants/drills';
import { formatDuration, generateId } from '../utils/helpers';
import { Drill } from '../types';

type Category = 'all' | 'warmup' | 'dinking' | 'thirds' | 'driving' | 'full';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  warmup: 'Warm-Up',
  dinking: 'Dinking',
  thirds: 'Third Shot',
  driving: 'Driving',
  full: 'Full Game',
};

export default function DrillsScreen() {
  const { addDrillSession } = useStore();
  const [category, setCategory] = useState<Category>('all');
  const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = BUILT_IN_DRILLS.filter(
    (d) => category === 'all' || d.category === category
  );

  const startDrill = (drill: Drill) => {
    setActiveDrill(drill);
    setTimeLeft(drill.durationSeconds);
    setRunning(false);
    setFinished(false);
  };

  const toggleTimer = () => {
    setRunning((r) => !r);
  };

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(activeDrill?.durationSeconds ?? 0);
    setFinished(false);
  };

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          Vibration.vibrate([0, 300, 100, 300]);
          if (activeDrill) {
            addDrillSession({
              id: generateId(),
              date: new Date().toISOString(),
              drillName: activeDrill.name,
              durationSeconds: activeDrill.durationSeconds,
            });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const progress = activeDrill
    ? 1 - timeLeft / activeDrill.durationSeconds
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Drills</Text>
        <Text style={styles.subtitle}>{BUILT_IN_DRILLS.length} drills ready</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.catBtn, category === c && styles.catBtnActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.catText, category === c && styles.catTextActive]}>
              {CATEGORY_LABELS[c]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map((drill) => (
          <TouchableOpacity
            key={drill.id}
            style={styles.drillCard}
            onPress={() => startDrill(drill)}
            activeOpacity={0.75}
          >
            <View style={styles.drillTop}>
              <View style={styles.drillInfo}>
                <Text style={styles.drillName}>{drill.name}</Text>
                <View style={styles.drillMeta}>
                  <View style={styles.catTag}>
                    <Text style={styles.catTagText}>{CATEGORY_LABELS[drill.category]}</Text>
                  </View>
                  <Text style={styles.drillDuration}>⏱ {formatDuration(drill.durationSeconds)}</Text>
                </View>
              </View>
              <View style={styles.startBtn}>
                <Text style={styles.startBtnText}>▶</Text>
              </View>
            </View>
            <Text style={styles.drillDesc} numberOfLines={2}>
              {drill.description}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Timer modal */}
      <Modal visible={activeDrill !== null} animationType="slide" presentationStyle="pageSheet">
        {activeDrill && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { resetTimer(); setActiveDrill(null); }}>
                <Text style={styles.modalClose}>✕ Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.catTagModal}>
                <Text style={styles.catTagText}>{CATEGORY_LABELS[activeDrill.category]}</Text>
              </View>
              <Text style={styles.modalDrillName}>{activeDrill.name}</Text>
              <Text style={styles.modalDesc}>{activeDrill.description}</Text>

              {/* Progress ring (simplified as a bar) */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                </View>
              </View>

              {/* Timer display */}
              {finished ? (
                <View style={styles.finishedContainer}>
                  <Text style={styles.finishedEmoji}>🎉</Text>
                  <Text style={styles.finishedTitle}>Drill Complete!</Text>
                  <Text style={styles.finishedSub}>Logged to your history.</Text>
                </View>
              ) : (
                <Text style={styles.timerDisplay}>{formatDuration(timeLeft)}</Text>
              )}

              <View style={styles.timerBtns}>
                <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
                  <Text style={styles.resetBtnText}>↺ Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playBtn, running && styles.pauseBtn]}
                  onPress={finished ? resetTimer : toggleTimer}
                >
                  <Text style={styles.playBtnText}>
                    {finished ? '↺ Again' : running ? '⏸ Pause' : '▶ Start'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: font.md, color: colors.textMuted, marginTop: 2 },
  catScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  catBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  catBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  catText: { fontSize: font.sm, color: colors.textSecondary, fontWeight: '500' },
  catTextActive: { color: colors.primaryDark, fontWeight: '700' },
  content: { padding: spacing.xl, paddingTop: spacing.sm },
  drillCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  drillTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  drillInfo: { flex: 1, marginRight: spacing.md },
  drillName: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  drillMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  catTagText: { fontSize: font.xs, color: colors.primaryDark, fontWeight: '600' },
  drillDuration: { fontSize: font.sm, color: colors.textMuted },
  startBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: font.md },
  drillDesc: { fontSize: font.sm, color: colors.textSecondary, lineHeight: 20 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalClose: { fontSize: font.md, color: colors.textSecondary },
  modalContent: { padding: spacing.xl, alignItems: 'center' },
  catTagModal: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  modalDrillName: {
    fontSize: font.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalDesc: {
    fontSize: font.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  progressContainer: { width: '100%', marginBottom: spacing.xl },
  progressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  timerDisplay: {
    fontSize: 80,
    fontWeight: '800',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.xl,
  },
  finishedContainer: { alignItems: 'center', marginBottom: spacing.xl },
  finishedEmoji: { fontSize: 64, marginBottom: spacing.md },
  finishedTitle: { fontSize: font.xxl, fontWeight: '800', color: colors.primary },
  finishedSub: { fontSize: font.md, color: colors.textSecondary, marginTop: spacing.xs },
  timerBtns: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  resetBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetBtnText: { fontSize: font.md, fontWeight: '600', color: colors.textSecondary },
  playBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  pauseBtn: { backgroundColor: colors.text },
  playBtnText: { fontSize: font.lg, fontWeight: '800', color: '#fff' },
});
