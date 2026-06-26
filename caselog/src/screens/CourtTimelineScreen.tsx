import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AttachmentPicker from '../components/AttachmentPicker';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { requestNotificationPermissions, scheduleEventNotification } from '../lib/notifications';
import { CourtDate } from '../types';

const TYPES = ['Hearing', 'Filing Deadline', 'Mediation', 'Deposition', 'Conference', 'Other'];
const STATUS_COLORS: Record<string, string> = { upcoming: '#4f46e5', completed: '#10b981', rescheduled: '#f59e0b' };

export default function CourtTimelineScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<CourtDate>('court_date');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<CourtDate>>({ date: '', type: 'Hearing', status: 'upcoming', attachment_paths: [] });

  async function handleSave() {
    if (!form.title?.trim() || !form.date?.trim()) { Alert.alert('Required', 'Title and date are required.'); return; }
    setSaving(true);
    await add({ date: form.date ?? '', time: form.time ?? '', title: form.title ?? '', type: form.type ?? 'Hearing', location: form.location ?? '', notes: form.notes ?? '', status: form.status ?? 'upcoming', attachment_paths: form.attachment_paths ?? [] });
    // Schedule 24h-before notification
    if (form.status === 'upcoming') {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleEventNotification(
          `Court: ${form.title}`,
          `Tomorrow at ${form.time || '9:00'} — ${form.location || form.type}`,
          form.date!, form.time, 24
        );
      }
    }
    setSaving(false);
    setModalOpen(false);
    setForm({ date: '', type: 'Hearing', status: 'upcoming', attachment_paths: [] });
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View style={styles.root}>
      <ScreenHeader title="Court Timeline" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>Legal</Text>
      </TouchableOpacity>
      <FlatList
        data={sorted}
        keyExtractor={r => r.id}
        contentContainerStyle={[sorted.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="calendar-outline" title="No court dates yet" subtitle="Track hearings, filing deadlines, and mediation sessions." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.dateCol}>
              <Text style={styles.dateDay}>{item.date.split('-')[2]}</Text>
              <Text style={styles.dateMon}>{new Date(item.date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.type}{item.time ? ` · ${item.time}` : ''}</Text>
              {item.location ? <Text style={styles.cardMeta}>📍 {item.location}</Text> : null}
              {(item.attachment_paths?.length ?? 0) > 0 && <Text style={styles.cardMeta}>📎 {item.attachment_paths!.length} file(s)</Text>}
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                <Ionicons name="trash-outline" size={15} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#6366f1" />

      <FormModal visible={modalOpen} title="Add Court Date" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Title *"><TextInput style={inputStyle} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Custody Hearing" /></Field>
        <Field label="Date *"><TextInput style={inputStyle} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" /></Field>
        <Field label="Time"><TextInput style={inputStyle} value={form.time} onChangeText={v => setForm(f => ({ ...f, time: v }))} placeholder="HH:MM" /></Field>
        <Field label="Type">
          <View style={styles.chips}>{TYPES.map(t => <Chip key={t} label={t} selected={form.type === t} onPress={() => setForm(f => ({ ...f, type: t }))} />)}</View>
        </Field>
        <Field label="Location"><TextInput style={inputStyle} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} placeholder="Courthouse, room number..." /></Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="Preparation notes..." multiline /></Field>
        <Field label="Status">
          <View style={styles.chips}>{['upcoming', 'completed', 'rescheduled'].map(s => <Chip key={s} label={s} selected={form.status === s} onPress={() => setForm(f => ({ ...f, status: s as any }))} color={STATUS_COLORS[s]} />)}</View>
        </Field>
        <Field label="Documents">
          <AttachmentPicker paths={form.attachment_paths ?? []} onChange={paths => setForm(f => ({ ...f, attachment_paths: paths }))} />
        </Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  dateCol: { width: 44, alignItems: 'center', backgroundColor: '#eef2ff', borderRadius: 12, paddingVertical: 8 },
  dateDay: { fontSize: 20, fontWeight: '800', color: '#4f46e5' },
  dateMon: { fontSize: 11, fontWeight: '600', color: '#6366f1', textTransform: 'uppercase' },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
