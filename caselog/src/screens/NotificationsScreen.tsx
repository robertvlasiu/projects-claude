import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle } from '../components/FormModal';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { requestNotificationPermissions, scheduleReminderNotification } from '../lib/notifications';
import { Reminder } from '../types';

const TYPES = ['Court Date', 'Custody Exchange', 'Filing Deadline', 'Attorney Meeting', 'Payment Due', 'Other'];
const TYPE_COLORS: Record<string, string> = { 'Court Date': '#ec4899', 'Custody Exchange': '#8b5cf6', 'Filing Deadline': '#ef4444', 'Attorney Meeting': '#10b981', 'Payment Due': '#f97316', Other: '#64748b' };

export default function NotificationsScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<Reminder>('reminder');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Reminder>>({ type: 'Court Date', completed: false });

  const pending = records.filter(r => !r.completed);
  const done = records.filter(r => r.completed);

  async function handleSave() {
    if (!form.title?.trim() || !form.date?.trim()) { Alert.alert('Required', 'Title and date are required.'); return; }
    setSaving(true);
    await add({ title: form.title ?? '', date: form.date ?? '', time: form.time ?? '', type: form.type ?? 'Other', completed: false });
    // Schedule device notification
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleReminderNotification(
        `⏰ ${form.title}`,
        `Your reminder: ${form.type}`,
        form.date!, form.time
      );
    }
    setSaving(false);
    setModalOpen(false);
    setForm({ type: 'Court Date', completed: false });
  }

  function ReminderCard({ item }: { item: Reminder & { id: string } }) {
    return (
      <View style={[styles.card, item.completed && styles.cardDone]}>
        <TouchableOpacity onPress={() => update(item.id, { completed: !item.completed })} style={[styles.check, item.completed && styles.checkDone]}>
          {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
        </TouchableOpacity>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, item.completed && styles.textDone]}>{item.title}</Text>
          <Text style={styles.cardMeta}>{item.date}{item.time ? ` · ${item.time}` : ''}</Text>
          <View style={[styles.badge, { backgroundColor: (TYPE_COLORS[item.type] ?? '#64748b') + '20' }]}>
            <Text style={[styles.badgeText, { color: TYPE_COLORS[item.type] ?? '#64748b' }]}>{item.type}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
          <Ionicons name="trash-outline" size={15} color="#cbd5e1" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Reminders" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>More</Text>
      </TouchableOpacity>
      {records.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <EmptyState icon="notifications-outline" title="No reminders yet" subtitle="Set alerts for court dates, custody exchanges, and deadlines." />
        </View>
      ) : (
        <FlatList
          data={[...pending, ...done]}
          keyExtractor={r => r.id}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          ListHeaderComponent={done.length > 0 && pending.length > 0 ? (
            <Text style={styles.sectionLabel}>Upcoming ({pending.length})</Text>
          ) : null}
          renderItem={({ item, index }) => (
            <>
              {index === pending.length && done.length > 0 && <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Completed ({done.length})</Text>}
              <ReminderCard item={item} />
            </>
          )}
        />
      )}
      <FAB onPress={() => setModalOpen(true)} color="#a855f7" />

      <FormModal visible={modalOpen} title="New Reminder" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Title *"><TextInput style={inputStyle} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Custody hearing at 9am" /></Field>
        <Field label="Date *"><TextInput style={inputStyle} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" /></Field>
        <Field label="Time"><TextInput style={inputStyle} value={form.time} onChangeText={v => setForm(f => ({ ...f, time: v }))} placeholder="HH:MM (for exact notification time)" /></Field>
        <Field label="Type">
          <View style={styles.chips}>{TYPES.map(t => <Chip key={t} label={t} selected={form.type === t} onPress={() => setForm(f => ({ ...f, type: t }))} color={TYPE_COLORS[t]} />)}</View>
        </Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardDone: { opacity: 0.55 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  checkDone: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  textDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  badge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, marginTop: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
