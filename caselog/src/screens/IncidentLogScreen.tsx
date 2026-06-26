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
import { Incident, Severity } from '../types';

const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
];

const SEVERITY_COLORS: Record<Severity, string> = { low: '#10b981', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function IncidentLogScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<Incident>('incident');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Incident>>({ date: new Date().toISOString().split('T')[0], severity: 'medium', attachment_paths: [] });

  function resetForm() { setForm({ date: new Date().toISOString().split('T')[0], severity: 'medium', attachment_paths: [] }); }

  async function handleSave() {
    if (!form.description?.trim()) { Alert.alert('Required', 'Please add a description.'); return; }
    setSaving(true);
    await add({ date: form.date ?? '', time: new Date().toTimeString().slice(0, 5), description: form.description ?? '', severity: form.severity ?? 'medium', location: form.location ?? '', witnesses: form.witnesses ?? '', attachment_paths: form.attachment_paths ?? [] });
    setSaving(false);
    setModalOpen(false);
    resetForm();
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Incident Log" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" />
        <Text style={styles.backText}>Case Log</Text>
      </TouchableOpacity>
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={[records.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="warning-outline" title="No incidents yet" subtitle="Tap + to log your first incident. Everything is encrypted." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[item.severity] }]} />
              <Text style={styles.cardDate}>{item.date} · {item.time}</Text>
              <View style={styles.spacer} />
              <TouchableOpacity onPress={() => Alert.alert('Delete?', 'Remove this incident?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                <Ionicons name="trash-outline" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[item.severity] + '20' }]}>
                <Text style={[styles.badgeText, { color: SEVERITY_COLORS[item.severity] }]}>{item.severity.toUpperCase()}</Text>
              </View>
              {item.location ? <Text style={styles.metaText}>📍 {item.location}</Text> : null}
              {(item.attachment_paths?.length ?? 0) > 0 && <Text style={styles.metaText}>📎 {item.attachment_paths!.length}</Text>}
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} />

      <FormModal visible={modalOpen} title="New Incident" onClose={() => { setModalOpen(false); resetForm(); }} onSave={handleSave} saving={saving}>
        <Field label="Date">
          <TextInput style={inputStyle} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" />
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
