import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import FAB from '../components/FAB';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { MoodEntry } from '../types';

const MOODS = [
  { value: 1, emoji: '😢', label: 'Very Low', color: '#ef4444' },
  { value: 2, emoji: '😔', label: 'Low', color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Neutral', color: '#f59e0b' },
  { value: 4, emoji: '😊', label: 'Good', color: '#10b981' },
  { value: 5, emoji: '😄', label: 'Great', color: '#4f46e5' },
];

const MOOD_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#10b981', 5: '#4f46e5' } as Record<number, string>;

export default function MoodJournalScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<MoodEntry>('mood');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<MoodEntry>>({ date: new Date().toISOString().split('T')[0], mood: 3, energy: 3 });

  async function handleSave() {
    setSaving(true);
    const id = await add({ date: form.date || new Date().toISOString().split('T')[0], mood: form.mood ?? 3, energy: form.energy ?? 3, notes: form.notes ?? '', triggers: form.triggers ?? '' });
    setSaving(false);
    if (!id) { Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
    setModalOpen(false);
    setForm({ date: new Date().toISOString().split('T')[0], mood: 3, energy: 3 });
  }

  const avgMood = records.length > 0 ? records.reduce((s, r) => s + r.mood, 0) / records.length : 0;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Mood Journal" />

      {records.length > 0 && (
        <View style={styles.avgCard}>
          <Text style={styles.avgEmoji}>{MOODS[Math.round(avgMood) - 1]?.emoji ?? '😐'}</Text>
          <View>
            <Text style={styles.avgLabel}>Average Mood</Text>
            <Text style={styles.avgValue}>{avgMood.toFixed(1)} / 5</Text>
          </View>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={!loading ? <EmptyState icon="heart-outline" title="No journal entries yet" subtitle="Check in daily. Your emotional record can matter in court." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.moodCircle, { backgroundColor: MOOD_COLORS[item.mood] + '20' }]}>
              <Text style={styles.moodEmoji}>{MOODS[item.mood - 1]?.emoji}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardDate}>{item.date}</Text>
              {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
              {item.triggers ? <Text style={styles.triggers}>Triggers: {item.triggers}</Text> : null}
            </View>
            <View style={styles.cardRight}>
              <View style={styles.energyRow}>
                <Ionicons name="flash" size={12} color="#f59e0b" />
                <Text style={styles.energy}>{item.energy}/5</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                <Ionicons name="trash-outline" size={14} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#ec4899" />
      <FormModal visible={modalOpen} title="Check In" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="How are you feeling?">
          <View style={styles.moodRow}>
            {MOODS.map(m => (
              <TouchableOpacity key={m.value} onPress={() => setForm(f => ({ ...f, mood: m.value }))} style={[styles.moodBtn, form.mood === m.value && { backgroundColor: m.color + '20', borderColor: m.color }]}>
                <Text style={styles.moodBtnEmoji}>{m.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.moodSelectedLabel}>{MOODS[(form.mood ?? 3) - 1]?.label}</Text>
        </Field>
        <Field label="Energy Level (1-5)">
          <View style={styles.moodRow}>
            {[1, 2, 3, 4, 5].map(e => (
              <TouchableOpacity key={e} onPress={() => setForm(f => ({ ...f, energy: e }))} style={[styles.energyBtn, form.energy === e && styles.energyBtnActive]}>
                <Text style={[styles.energyBtnText, form.energy === e && styles.energyBtnTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="How was your day? What's weighing on you?" multiline /></Field>
        <Field label="Triggers"><TextInput style={inputStyle} value={form.triggers} onChangeText={v => setForm(f => ({ ...f, triggers: v }))} placeholder="What affected your mood today?" /></Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  avgCard: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: 16, padding: 16, backgroundColor: '#fff1f2', borderRadius: 16 },
  avgEmoji: { fontSize: 36 },
  avgLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  avgValue: { fontSize: 20, fontWeight: '800', color: '#f43f5e' },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  moodCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  moodEmoji: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardDate: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
  notes: { fontSize: 13, color: '#334155', lineHeight: 18 },
  triggers: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  energyRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  energy: { fontSize: 12, fontWeight: '600', color: '#f59e0b' },
  moodRow: { flexDirection: 'row', gap: 8 },
  moodBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  moodBtnEmoji: { fontSize: 24 },
  moodSelectedLabel: { textAlign: 'center', fontSize: 13, color: '#64748b', fontWeight: '600', marginTop: 6 },
  energyBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  energyBtnActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  energyBtnText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  energyBtnTextActive: { color: '#fff' },
});
