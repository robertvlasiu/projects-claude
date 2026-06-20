import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { generateId, toDateKey, addDaysToDate, formatDate, getHatchDaysLeft } from '../utils/helpers';
import { HatchBatch } from '../types';

export default function HatchScreen() {
  const { hatchBatches, addHatchBatch, updateHatchBatch, deleteHatchBatch } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [eggsSet, setEggsSet] = useState('');
  const [breed, setBreed] = useState('');
  const [notes, setNotes] = useState('');

  const incubating = hatchBatches.filter((b) => b.status === 'incubating');
  const completed = hatchBatches.filter((b) => b.status !== 'incubating');

  const handleAdd = () => {
    if (!batchName.trim() || !eggsSet) {
      Alert.alert('Missing info', 'Please enter a name and number of eggs.');
      return;
    }
    const n = parseInt(eggsSet);
    if (isNaN(n) || n <= 0) {
      Alert.alert('Invalid', 'Please enter a valid number of eggs.');
      return;
    }
    const startDate = toDateKey();
    const batch: HatchBatch = {
      id: generateId(),
      name: batchName.trim(),
      startDate,
      eggsSet: n,
      breed: breed.trim() || undefined,
      notes: notes.trim() || undefined,
      expectedHatchDate: addDaysToDate(startDate, 21),
      status: 'incubating',
    };
    addHatchBatch(batch);
    setBatchName('');
    setEggsSet('');
    setBreed('');
    setNotes('');
    setShowModal(false);
  };

  const handleComplete = (batch: HatchBatch, hatched: number) => {
    updateHatchBatch({ ...batch, actualHatched: hatched, status: 'hatched' });
  };

  const handleFail = (batch: HatchBatch) => {
    updateHatchBatch({ ...batch, status: 'failed' });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Batch', 'Remove this hatch batch?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHatchBatch(id) },
    ]);
  };

  const promptComplete = (batch: HatchBatch) => {
    Alert.prompt(
      'Hatch Complete!',
      'How many chicks hatched?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (val: string | undefined) => {
            const n = parseInt(val ?? '0');
            if (!isNaN(n)) handleComplete(batch, n);
          },
        },
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

  const renderBatch = (batch: HatchBatch) => {
    const daysLeft = getHatchDaysLeft(batch.expectedHatchDate);
    const start = new Date(batch.startDate);
    const expected = new Date(batch.expectedHatchDate);
    const now = new Date();
    const totalDays = (expected.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(elapsed / totalDays, 1);
    const currentDay = Math.min(Math.round(elapsed), 21);

    return (
      <View key={batch.id} style={styles.batchCard}>
        <View style={styles.batchHeader}>
          <View>
            <Text style={styles.batchName}>{batch.name}</Text>
            <Text style={styles.batchMeta}>
              {batch.eggsSet} eggs · {batch.breed ?? 'Mixed'}
            </Text>
          </View>
          {batch.status === 'incubating' ? (
            <View style={[styles.statusBadge, styles.statusIncubating]}>
              <Text style={styles.statusText}>Day {currentDay}/21</Text>
            </View>
          ) : batch.status === 'hatched' ? (
            <View style={[styles.statusBadge, styles.statusHatched]}>
              <Text style={styles.statusText}>Hatched 🐥</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusFailed]}>
              <Text style={styles.statusText}>Failed</Text>
            </View>
          )}
        </View>

        {batch.status === 'incubating' && (
          <>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            </View>
            <View style={styles.batchTimeline}>
              <Text style={styles.timelineText}>Started: {formatDate(batch.startDate)}</Text>
              <Text style={[styles.timelineText, daysLeft <= 3 && styles.timelineSoon]}>
                {daysLeft > 0 ? `${daysLeft} days to hatch` : 'Hatch due today!'}
              </Text>
            </View>
            <View style={styles.batchActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => promptComplete(batch)}
              >
                <Text style={styles.actionBtnText}>🐥 Hatched!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnFail]}
                onPress={() => handleFail(batch)}
              >
                <Text style={styles.actionBtnFailText}>Mark Failed</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {batch.status === 'hatched' && batch.actualHatched !== undefined && (
          <View style={styles.hatchResult}>
            <Text style={styles.hatchResultText}>
              🐥 {batch.actualHatched} of {batch.eggsSet} hatched
              {' '}({Math.round((batch.actualHatched / batch.eggsSet) * 100)}% success rate)
            </Text>
          </View>
        )}

        {batch.notes ? (
          <Text style={styles.batchNotes}>{batch.notes}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.deleteRowBtn}
          onPress={() => handleDelete(batch.id)}
        >
          <Text style={styles.deleteRowBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hatching</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ New Batch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {incubating.length === 0 && completed.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🥚</Text>
            <Text style={styles.emptyTitle}>No active batches</Text>
            <Text style={styles.emptyText}>
              Start tracking an incubation batch. The app will count down your 21-day hatch window.
            </Text>
          </View>
        )}

        {incubating.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🌡 Currently Incubating</Text>
            {incubating.map(renderBatch)}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>History</Text>
            {completed.map(renderBatch)}
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* New batch modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Hatch Batch</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={styles.modalSave}>Start</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                🌡 Standard chicken incubation is 21 days at 99.5°F / 37.5°C. Turn eggs 3× daily (stop at day 18 for lockdown).
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Batch Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Spring 2025 Batch, Buff Orpington Set"
                placeholderTextColor={colors.textMuted}
                value={batchName}
                onChangeText={setBatchName}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Eggs Set *</Text>
              <TextInput
                style={styles.input}
                placeholder="12"
                placeholderTextColor={colors.textMuted}
                value={eggsSet}
                onChangeText={setEggsSet}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Breed (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Rhode Island Red, mixed, etc."
                placeholderTextColor={colors.textMuted}
                value={breed}
                onChangeText={setBreed}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Source, incubator model, humidity setting..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  content: { padding: spacing.xl, paddingTop: spacing.xs },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  batchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  batchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  batchName: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  batchMeta: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  statusIncubating: { backgroundColor: colors.primaryLight },
  statusHatched: { backgroundColor: colors.secondaryLight },
  statusFailed: { backgroundColor: colors.errorLight },
  statusText: { fontSize: font.xs, fontWeight: '700', color: colors.text },
  progressBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  batchTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  timelineText: { fontSize: font.xs, color: colors.textMuted },
  timelineSoon: { color: colors.error, fontWeight: '700' },
  batchActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  actionBtnFail: { backgroundColor: colors.errorLight },
  actionBtnText: { fontSize: font.sm, fontWeight: '700', color: colors.secondaryDark },
  actionBtnFailText: { fontSize: font.sm, fontWeight: '700', color: colors.error },
  hatchResult: {
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  hatchResultText: { fontSize: font.md, color: colors.secondaryDark, fontWeight: '600' },
  batchNotes: { fontSize: font.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  deleteRowBtn: { marginTop: spacing.md, alignSelf: 'flex-end' },
  deleteRowBtnText: { fontSize: font.sm, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptyText: { fontSize: font.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  modalCancel: { fontSize: font.md, color: colors.textSecondary },
  modalSave: { fontSize: font.md, color: colors.primary, fontWeight: '700' },
  modalContent: { padding: spacing.xl },
  infoBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoBoxText: { fontSize: font.sm, color: colors.primaryDark, lineHeight: 20 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
});
