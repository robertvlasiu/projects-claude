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
import { Incident, Severity } from '../types';

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
];

const SEVERITY_COLORS: Record<Severity, string> = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

const emptyForm = (): Partial<Incident> => ({
  date: new Date().toISOString().split('T')[0],
  severity: 'medium',
  attachment_paths: [],
});

export default function IncidentLogScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<Incident>('incident');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Incident>>(emptyForm());

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(item: SavedRecord<Incident>) {
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
    if (!form.description?.trim()) { Alert.alert('Add a description', 'Briefly note what happened so this entry is useful later.'); return; }
    setSaving(true);
    const payload = {
      date: form.date || new Date().toISOString().split('T')[0],
      time: form.time || new Date().toTimeString().slice(0, 5),
      description: form.description ?? '',
      severity: form.severity ?? 'medium',
      location: form.location ?? '',
      witnesses: form.witnesses ?? '',
      attachment_paths: form.attachment_paths ?? [],
    };
    if (editingId) {
      await update(editingId, payload);
      setSaving(false);
      closeModal();
      return;
    }
    const id = await add(payload);
    setSaving(false);
    if (!id) { Alert.alert('Could not save', 'Something went wrong saving your entry. Check your connection and try again.'); return; }
    closeModal();
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Incident Log" />
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={[records.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="warning-outline" title="No incidents yet" subtitle="Document what happened, when, and who saw it. Everything is encrypted." actionLabel="Log your first incident" onAction={openNew} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[item.severity] }]} />
              <Text style={styles.cardDate}>{item.date} · {item.time}</Text>
              <View style={styles.spacer} />
              <RecordActions onEdit={() => openEdit(item)} onDelete={() => remove(item.id)} deleteMessage="Remove this incident?" />
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[item.severity] + '20' }]}>
                <Text style={[styles.badgeText, { color: SEVERITY_COLORS[item.severity] }]}>{item.severity.toUpperCase()}</Text>
              </View>
              {item.location ? <Text style={styles.metaText}>📍 {item.location}</Text> : null}
              {item.witnesses ? <Text style={styles.metaText}>👁 {item.witnesses}</Text> : null}
            </View>
            {(item.attachment_paths?.length ?? 0) > 0 && (
              <AttachmentList paths={item.attachment_paths} />
            )}
          </View>
        )}
      />
      <FAB onPress={openNew} />

      <FormModal visible={modalOpen} title={editingId ? 'Edit Incident' : 'New Incident'} onClose={closeModal} onSave={handleSave} saving={saving} uploading={uploading}>
        <Field label="Date">
          <DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
        </Field>
        <Field label="Description *">
          <TextInput style={textAreaStyle} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="What happened?" multiline />
        </Field>
        <Field label="Severity">
          <View style={styles.chips}>
            {SEVERITIES.map(s => <Chip key={s.value} label={s.label} selected={form.severity === s.value} onPress={() => setForm(f => ({ ...f, severity: s.value }))} color={s.color} />)}
          </View>
        </Field>
        <Field label="Location">
          <TextInput style={inputStyle} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} placeholder="Where did this happen?" />
        </Field>
        <Field label="Witnesses">
          <TextInput style={inputStyle} value={form.witnesses} onChangeText={v => setForm(f => ({ ...f, witnesses: v }))} placeholder="Names of witnesses" />
        </Field>
        <Field label="Attachments">
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  cardDate: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  spacer: { flex: 1 },
  cardDesc: { fontSize: 15, color: '#1e293b', lineHeight: 22, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  metaText: { fontSize: 12, color: '#94a3b8' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
