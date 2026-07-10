import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import AttachmentList from '../components/AttachmentList';
import AttachmentPicker from '../components/AttachmentPicker';
import Chip from '../components/Chip';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import RecordActions from '../components/RecordActions';
import ScreenHeader from '../components/ScreenHeader';
import { SavedRecord, useRecords } from '../hooks/useRecords';
import { requestNotificationPermissions, scheduleEventNotification } from '../lib/notifications';
import { CourtDate } from '../types';

const TYPES = ['Hearing', 'Filing Deadline', 'Mediation', 'Deposition', 'Conference', 'Other'];
const STATUS_COLORS: Record<string, string> = { upcoming: '#4f46e5', completed: '#10b981', rescheduled: '#f59e0b' };

const emptyForm = (): Partial<CourtDate> => ({
  date: '',
  type: 'Hearing',
  status: 'upcoming',
  attachment_paths: [],
});

export default function CourtTimelineScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<CourtDate>('court_date');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CourtDate>>(emptyForm());

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(item: SavedRecord<CourtDate>) {
    const { id, created_at, ...rest } = item;
    setEditingId(id);
    setForm({ ...rest, attachment_paths: rest.attachment_paths ?? [] });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setUploading(false);
  }

  async function handleSave() {
    if (uploading) return;
    if (!form.title?.trim() || !form.date?.trim()) { Alert.alert('Add a title and date', 'A court date needs at least a title and a date.'); return; }
    setSaving(true);
    const payload = {
      date: form.date ?? '',
      time: form.time ?? '',
      title: form.title ?? '',
      type: form.type ?? 'Hearing',
      location: form.location ?? '',
      notes: form.notes ?? '',
      status: form.status ?? 'upcoming',
      attachment_paths: form.attachment_paths ?? [],
    };
    if (editingId) {
      await update(editingId, payload);
      setSaving(false);
      closeModal();
      return;
    }
    const id = await add(payload);
    if (!id) { setSaving(false); Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
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
    closeModal();
  }

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View style={styles.root}>
      <ScreenHeader title="Court Timeline" />
      <FlatList
        data={sorted}
        keyExtractor={r => r.id}
        contentContainerStyle={[sorted.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="calendar-outline" title="No court dates yet" subtitle="Track hearings, filing deadlines, and mediation sessions. You'll get an alert 24h before each one." actionLabel="Add a court date" onAction={openNew} /> : null}
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
              {item.notes ? <Text style={styles.cardMeta} numberOfLines={2}>{item.notes}</Text> : null}
              {(item.attachment_paths?.length ?? 0) > 0 && (
                <AttachmentList paths={item.attachment_paths!} />
              )}
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
              </View>
              <RecordActions onEdit={() => openEdit(item)} onDelete={() => remove(item.id)} iconSize={15} />
            </View>
          </View>
        )}
      />
      <FAB onPress={openNew} color="#6366f1" />

      <FormModal visible={modalOpen} title={editingId ? 'Edit Court Date' : 'Add Court Date'} onClose={closeModal} onSave={handleSave} saving={saving} uploading={uploading}>
        <Field label="Title *"><TextInput style={inputStyle} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Custody Hearing" /></Field>
        <Field label="Date *"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="Time"><DateField mode="time" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} /></Field>
        <Field label="Type">
          <View style={styles.chips}>{TYPES.map(t => <Chip key={t} label={t} selected={form.type === t} onPress={() => setForm(f => ({ ...f, type: t }))} />)}</View>
        </Field>
        <Field label="Location"><TextInput style={inputStyle} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} placeholder="Courthouse, room number..." /></Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="Preparation notes..." multiline /></Field>
        <Field label="Status">
          <View style={styles.chips}>{['upcoming', 'completed', 'rescheduled'].map(s => <Chip key={s} label={s} selected={form.status === s} onPress={() => setForm(f => ({ ...f, status: s as CourtDate['status'] }))} color={STATUS_COLORS[s]} />)}</View>
        </Field>
        <Field label="Documents">
          <AttachmentPicker paths={form.attachment_paths ?? []} onChange={paths => setForm(f => ({ ...f, attachment_paths: paths }))} recordId={editingId ?? 'temp'} onUploadingChange={setUploading} />
        </Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
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
