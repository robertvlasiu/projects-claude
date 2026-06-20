import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { generateId, toDateKey, formatDateShort, getEggStatsForPeriod } from '../utils/helpers';

const FEED_TYPES = [
  'Layer Pellets',
  'Layer Crumble',
  'Scratch Grains',
  'Mealworms',
  'Chick Starter',
  'Flock Raiser',
  'Oyster Shell',
  'Grit',
  'Fermented Feed',
  'Kitchen Scraps',
];

export default function FeedScreen() {
  const { feedLogs, eggLogs, birds, addFeedLog, deleteFeedLog } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [feedType, setFeedType] = useState('Layer Pellets');
  const [customFeed, setCustomFeed] = useState('');
  const [amountLbs, setAmountLbs] = useState('');
  const [costUsd, setCostUsd] = useState('');
  const [showFeedPicker, setShowFeedPicker] = useState(false);

  const activeHens = birds.filter((b) => b.isActive && b.sex === 'hen').length;
  const stats30 = getEggStatsForPeriod(eggLogs, 30);

  const last30FeedLogs = feedLogs.filter((l) => {
    const d = new Date(l.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return d >= cutoff;
  });

  const totalCost30 = last30FeedLogs.reduce((s, l) => s + l.costUsd, 0);
  const totalLbs30 = last30FeedLogs.reduce((s, l) => s + l.amountLbs, 0);
  const costPerDozen =
    stats30.total > 0 ? ((totalCost30 / stats30.total) * 12).toFixed(2) : null;

  const handleAdd = () => {
    const type = customFeed.trim() || feedType;
    const lbs = parseFloat(amountLbs);
    const cost = parseFloat(costUsd);
    if (!type || isNaN(lbs) || isNaN(cost)) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    addFeedLog({
      id: generateId(),
      date: toDateKey(),
      feedType: type,
      amountLbs: lbs,
      costUsd: cost,
    });
    setAmountLbs('');
    setCostUsd('');
    setCustomFeed('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this feed log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFeedLog(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed Tracker</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+ Log Feed</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Cost per dozen */}
        {costPerDozen !== null && (
          <View style={styles.costHeroCard}>
            <Text style={styles.costHeroLabel}>Cost per dozen eggs (30 days)</Text>
            <Text style={styles.costHeroValue}>${costPerDozen}</Text>
            <Text style={styles.costHeroSub}>
              ${totalCost30.toFixed(2)} feed · {stats30.total} eggs · {activeHens} hens
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalCost30.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Feed cost (30d)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalLbs30.toFixed(0)} lbs</Text>
            <Text style={styles.statLabel}>Feed used (30d)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{feedLogs.length}</Text>
            <Text style={styles.statLabel}>Total entries</Text>
          </View>
        </View>

        {/* Feed log list */}
        <Text style={styles.sectionTitle}>Feed History</Text>
        {feedLogs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌾</Text>
            <Text style={styles.emptyTitle}>No feed logged yet</Text>
            <Text style={styles.emptyText}>
              Track your feed costs to calculate your real cost per dozen eggs.
            </Text>
          </View>
        ) : (
          feedLogs.map((log) => (
            <TouchableOpacity
              key={log.id}
              style={styles.feedRow}
              onLongPress={() => handleDelete(log.id)}
            >
              <View style={styles.feedRowLeft}>
                <Text style={styles.feedType}>{log.feedType}</Text>
                <Text style={styles.feedDate}>{formatDateShort(log.date)}</Text>
              </View>
              <View style={styles.feedRowRight}>
                <Text style={styles.feedCost}>${log.costUsd.toFixed(2)}</Text>
                <Text style={styles.feedAmount}>{log.amountLbs} lbs</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Text style={styles.deleteHint}>Long press a row to delete</Text>
      </ScrollView>

      {/* Add modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Feed</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Feed Type</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setShowFeedPicker(true)}>
                <Text style={styles.pickerValue}>{feedType}</Text>
                <Text style={styles.pickerArrow}>›</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { marginTop: spacing.xs }]}
                placeholder="Or type a custom feed"
                placeholderTextColor={colors.textMuted}
                value={customFeed}
                onChangeText={setCustomFeed}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amount (lbs)</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                placeholderTextColor={colors.textMuted}
                value={amountLbs}
                onChangeText={setAmountLbs}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Cost ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="18.99"
                placeholderTextColor={colors.textMuted}
                value={costUsd}
                onChangeText={setCostUsd}
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Feed type picker */}
        <Modal visible={showFeedPicker} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Feed Type</Text>
              <TouchableOpacity onPress={() => setShowFeedPicker(false)}>
                <Text style={styles.modalSave}>Done</Text>
              </TouchableOpacity>
            </View>
            {FEED_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.breedRow}
                onPress={() => {
                  setFeedType(type);
                  setShowFeedPicker(false);
                }}
              >
                <Text style={[styles.breedLabel, feedType === type && styles.breedLabelActive]}>
                  {type}
                </Text>
                {feedType === type && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
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
  content: { padding: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.xxxl },
  costHeroCard: {
    backgroundColor: colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  costHeroLabel: { fontSize: font.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  costHeroValue: { fontSize: 52, fontWeight: '800', color: '#fff' },
  costHeroSub: { fontSize: font.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.sm,
  },
  statValue: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  feedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    ...shadow.sm,
  },
  feedRowLeft: {},
  feedType: { fontSize: font.md, fontWeight: '600', color: colors.text },
  feedDate: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  feedRowRight: { alignItems: 'flex-end' },
  feedCost: { fontSize: font.lg, fontWeight: '800', color: colors.secondary },
  feedAmount: { fontSize: font.xs, color: colors.textMuted },
  deleteHint: { fontSize: font.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
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
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.xs,
  },
  pickerValue: { fontSize: font.md, color: colors.text },
  pickerArrow: { fontSize: font.xl, color: colors.textMuted },
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
  breedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breedLabel: { fontSize: font.md, color: colors.text },
  breedLabelActive: { color: colors.primary, fontWeight: '700' },
  check: { color: colors.primary, fontSize: font.md, fontWeight: '700' },
});
