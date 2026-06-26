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

export default function CommunicationLogScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<Communication>('communication');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Communication>>({ date: new Date().toISOString().split('T')[0], method: 'call', tone: 'neutral', attachment_paths: [] });

  async function handleSave() {
    if (!form.party?.trim() || !form.summary?.trim()) { Alert.alert('Required', 'Party and summary are required.'); return; }
    setSaving(true);
    await add({ date: form.date ?? '', time: new Date().toTimeString().slice(0, 5), method: form.method ?? 'call', party: form.party ?? '', summary: form.summary ?? '', tone: form.tone ?? 'neutral', duration: form.duration ?? '', attachment_paths: form.attachment_paths ?? [] });
    setSaving(false);
    setModalOpen(false);
    setForm({ date: new Date().toISOString().split('T')[0], method: 'call', tone: 'neutral', attachment_paths: [] });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Communications" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>Case Log</Text>
      </TouchableOpacity>
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={[records.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="chatbubbles-outline" title="No communications yet" subtitle="Log every call, text, and email with the other party." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.toneBar, { backgroundColor: TONE_COLORS[item.tone] }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Ionicons name={METHOD_ICONS[item.method]} size={14} color="#94a3b8" />
                <Text style={styles.cardDate}>{item.date} · {item.time}</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                  <Ionicons name="trash-outline" size={15} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
              <Text style={styles.party}>{item.party}</Text>
              <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
              <View style={styles.cardMeta}>
                <View style={[styles.badge, { backgroundColor: TONE_COLORS[item.tone] + '20' }]}>
                  <Text style={[styles.badgeText, { color: TONE_COLORS[item.tone] }]}>{item.tone.toUpperCase()}</Text>
                </View>
                {item.duration ? <Text style={styles.metaText}>⏱ {item.duration} min</Text> : null}
                {(item.attachment_paths?.length ?? 0) > 0 && <Text style={styles.metaText}>📎 {item.attachment_paths!.length}</Text>}
              </View>
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#8b5cf6" />

      <FormModal visible={modalOpen} title="Log Communication" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Date"><TextInput style={inputStyle} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" /></Field>
        <Field label="Method">
          <View style={styles.chips}>{METHODS.map(m => <Chip key={m.value} label={m.label} selected={form.method === m.value} onPress={() => setForm(f => ({ ...f, method: m.value }))} />)}</View>
        </Field>
        <Field label="With (party) *"><TextInput style={inputStyle} value={form.party} onChangeText={v => setForm(f => ({ ...f, party: v }))} placeholder="Ex-spouse, their attorney..." /></Field>
        <Field label="Summary *"><TextInput style={textAreaStyle} value={form.summary} onChangeText={v => setForm(f => ({ ...f, summary: v }))} placeholder="What was discussed?" multiline /></Field>
        <Field label="Tone">
          <View style={styles.chips}>{TONES.map(t => <Chip key={t.value} label={t.label} selected={form.tone === t.value} onPress={() => setForm(f => ({ ...f, tone: t.value }))} color={t.color} />)}</View>
        </Field>
        <Field label="Duration (minutes)"><TextInput style={inputStyle} value={form.duration} onChangeText={v => setForm(f => ({ ...f, duration: v }))} placeholder="15" keyboardType="number-pad" /></Field>
        <Field label="Screenshots / Files">
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
