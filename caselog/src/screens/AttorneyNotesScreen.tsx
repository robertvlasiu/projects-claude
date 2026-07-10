import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import AttachmentList from '../components/AttachmentList';
import AttachmentPicker from '../components/AttachmentPicker';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import RecordActions from '../components/RecordActions';
import ScreenHeader from '../components/ScreenHeader';
import { SavedRecord, useRecords } from '../hooks/useRecords';
import { AttorneyNote } from '../types';

const emptyForm = (): Partial<AttorneyNote> => ({
  date: new Date().toISOString().split('T')[0],
  attachment_paths: [],
});

export default function AttorneyNotesScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<AttorneyNote>('attorney_note');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AttorneyNote>>(emptyForm());

  const totalBilled = records.reduce((sum, r) => sum + parseFloat(r.billed_hours || '0'), 0);
  const totalCost = records.reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0);

  function openNew() {
    const last = records[0];
    setEditingId(null);
    setForm({
      date: new Date().toISOString().split('T')[0],
      attorney_name: last?.attorney_name ?? '',
      cost: last?.cost ?? '',
      attachment_paths: [],
    });
    setModalOpen(true);
  }

  function openEdit(item: SavedRecord<AttorneyNote>) {
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
    if (!form.notes?.trim() && !form.cost?.trim() && !form.attorney_name?.trim()) {
      Alert.alert('Add a detail', 'Add at least notes, a cost, or the attorney before saving.'); return;
    }
    setSaving(true);
    const payload = {
      date: form.date || new Date().toISOString().split('T')[0],
      attorney_name: form.attorney_name ?? '',
      duration_minutes: form.duration_minutes ?? '',
      billed_hours: form.billed_hours ?? '',
      notes: form.notes ?? '',
      action_items: form.action_items ?? '',
      cost: form.cost ?? '',
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
    if (!id) { Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
    closeModal();
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Attorney Notes" />
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalBilled.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Billed Hours</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f97316' }]}>${totalCost.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Cost</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{records.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={[records.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="briefcase-outline" title="No attorney notes yet" subtitle="Log every meeting and call with your lawyer." actionLabel="Log a meeting" onAction={openNew} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardDate}>{item.date}</Text>
              {item.attorney_name ? <Text style={styles.attorney}>· {item.attorney_name}</Text> : null}
              <View style={{ flex: 1 }} />
              {item.billed_hours ? <Text style={styles.hours}>{item.billed_hours}h</Text> : null}
              {item.cost ? <Text style={styles.cost}>${item.cost}</Text> : null}
              <RecordActions onEdit={() => openEdit(item)} onDelete={() => remove(item.id)} iconSize={15} />
            </View>
            <Text style={styles.notes}>{item.notes}</Text>
            {item.action_items ? (
              <View style={styles.actionWrap}>
                <Text style={styles.actionLabel}>Action Items:</Text>
                <Text style={styles.actionText}>{item.action_items}</Text>
              </View>
            ) : null}
            {(item.attachment_paths?.length ?? 0) > 0 && (
              <AttachmentList paths={item.attachment_paths!} />
            )}
          </View>
        )}
      />
      <FAB onPress={openNew} color="#f97316" />

      <FormModal visible={modalOpen} title={editingId ? 'Edit Meeting' : 'Attorney Meeting'} onClose={closeModal} onSave={handleSave} saving={saving} uploading={uploading}>
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="Attorney Name"><TextInput style={inputStyle} value={form.attorney_name} onChangeText={v => setForm(f => ({ ...f, attorney_name: v }))} placeholder="Full name" /></Field>
        <Field label="Duration (minutes)"><TextInput style={inputStyle} value={form.duration_minutes} onChangeText={v => setForm(f => ({ ...f, duration_minutes: v }))} keyboardType="number-pad" placeholder="60" /></Field>
        <Field label="Billed Hours"><TextInput style={inputStyle} value={form.billed_hours} onChangeText={v => setForm(f => ({ ...f, billed_hours: v }))} keyboardType="decimal-pad" placeholder="1.0" /></Field>
        <Field label="Cost ($)"><TextInput style={inputStyle} value={form.cost} onChangeText={v => setForm(f => ({ ...f, cost: v }))} keyboardType="decimal-pad" placeholder="250.00" /></Field>
        <Field label="Meeting Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="What was discussed?" multiline /></Field>
        <Field label="Action Items"><TextInput style={textAreaStyle} value={form.action_items} onChangeText={v => setForm(f => ({ ...f, action_items: v }))} placeholder="Things to do before next meeting..." multiline /></Field>
        <Field label="Bills / Invoices">
          <AttachmentPicker paths={form.attachment_paths ?? []} onChange={paths => setForm(f => ({ ...f, attachment_paths: paths }))} recordId={editingId ?? 'temp'} onUploadingChange={setUploading} />
        </Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#4f46e5', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardDate: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  attorney: { fontSize: 13, color: '#64748b' },
  hours: { fontSize: 13, fontWeight: '700', color: '#4f46e5', backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cost: { fontSize: 13, fontWeight: '700', color: '#f97316' },
  notes: { fontSize: 14, color: '#334155', lineHeight: 20 },
  actionWrap: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 10 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4 },
  actionText: { fontSize: 13, color: '#1e293b' },
});
