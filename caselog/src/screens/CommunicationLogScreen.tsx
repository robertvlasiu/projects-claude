import { Ionicons } from '@expo/vector-icons';
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
import { CommMethod, Communication, Tone } from '../types';

const METHODS: { value: CommMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'call', label: 'Call', icon: 'call' },
  { value: 'text', label: 'Text', icon: 'chatbubble' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'in_person', label: 'In Person', icon: 'person' },
];

const TONES: { value: Tone; label: string; color: string }[] = [
  { value: 'cooperative', label: 'Cooperative', color: '#10b981' },
  { value: 'neutral', label: 'Neutral', color: '#64748b' },
  { value: 'tense', label: 'Tense', color: '#f59e0b' },
  { value: 'hostile', label: 'Hostile', color: '#ef4444' },
];

const TONE_COLORS: Record<Tone, string> = { cooperative: '#10b981', neutral: '#64748b', tense: '#f59e0b', hostile: '#ef4444' };
const METHOD_ICONS: Record<CommMethod, keyof typeof Ionicons.glyphMap> = { call: 'call', text: 'chatbubble', email: 'mail', in_person: 'person' };

const emptyForm = (): Partial<Communication> => ({
  date: new Date().toISOString().split('T')[0],
  method: 'call',
  tone: 'neutral',
  attachment_paths: [],
});

export default function CommunicationLogScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<Communication>('communication');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Communication>>(emptyForm());

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(item: SavedRecord<Communication>) {
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
    if (!form.summary?.trim()) { Alert.alert('Add a summary', 'Note what was said or agreed so this log is useful later.'); return; }
    setSaving(true);
    const payload = {
      date: form.date || new Date().toISOString().split('T')[0],
      time: form.time || new Date().toTimeString().slice(0, 5),
      method: form.method ?? 'call',
      party: form.party ?? '',
      summary: form.summary ?? '',
      tone: form.tone ?? 'neutral',
      duration: form.duration ?? '',
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
      <ScreenHeader title="Communications" />
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={[records.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="chatbubbles-outline" title="No communications yet" subtitle="Log every call, text, and email with the other party." actionLabel="Log a communication" onAction={openNew} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.toneBar, { backgroundColor: TONE_COLORS[item.tone] }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Ionicons name={METHOD_ICONS[item.method]} size={14} color="#94a3b8" />
                <Text style={styles.cardDate}>{item.date} · {item.time}</Text>
                <View style={{ flex: 1 }} />
                <RecordActions onEdit={() => openEdit(item)} onDelete={() => remove(item.id)} />
              </View>
              <Text style={styles.party}>{item.party}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
              <View style={styles.cardMeta}>
                <View style={[styles.badge, { backgroundColor: TONE_COLORS[item.tone] + '20' }]}>
                  <Text style={[styles.badgeText, { color: TONE_COLORS[item.tone] }]}>{item.tone.toUpperCase()}</Text>
                </View>
                {item.duration ? <Text style={styles.metaText}>⏱ {item.duration} min</Text> : null}
              </View>
              {(item.attachment_paths?.length ?? 0) > 0 && (
                <AttachmentList paths={item.attachment_paths!} />
              )}
            </View>
          </View>
        )}
      />
      <FAB onPress={openNew} color="#8b5cf6" />

      <FormModal visible={modalOpen} title={editingId ? 'Edit Communication' : 'Log Communication'} onClose={closeModal} onSave={handleSave} saving={saving} uploading={uploading}>
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="Method">
          <View style={styles.chips}>{METHODS.map(m => <Chip key={m.value} label={m.label} selected={form.method === m.value} onPress={() => setForm(f => ({ ...f, method: m.value }))} />)}</View>
        </Field>
        <Field label="With (party)"><TextInput style={inputStyle} value={form.party} onChangeText={v => setForm(f => ({ ...f, party: v }))} placeholder="Ex-spouse, their attorney..." /></Field>
        <Field label="Summary *"><TextInput style={textAreaStyle} value={form.summary} onChangeText={v => setForm(f => ({ ...f, summary: v }))} placeholder="What was discussed?" multiline /></Field>
        <Field label="Tone">
          <View style={styles.chips}>{TONES.map(t => <Chip key={t.value} label={t.label} selected={form.tone === t.value} onPress={() => setForm(f => ({ ...f, tone: t.value }))} color={t.color} />)}</View>
        </Field>
        <Field label="Duration (minutes)"><TextInput style={inputStyle} value={form.duration} onChangeText={v => setForm(f => ({ ...f, duration: v }))} placeholder="15" keyboardType="number-pad" /></Field>
        <Field label="Screenshots / Files">
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
  card: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  toneBar: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  cardDate: { fontSize: 12, color: '#94a3b8' },
  party: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  summary: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  metaText: { fontSize: 12, color: '#94a3b8' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
