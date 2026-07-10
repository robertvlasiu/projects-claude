import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AttachmentList from '../components/AttachmentList';
import Chip from '../components/Chip';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import FAB from '../components/FAB';
import RecordActions from '../components/RecordActions';
import ScreenHeader from '../components/ScreenHeader';
import { SavedRecord, useRecords } from '../hooks/useRecords';
import { attachmentPath, uploadEncryptedFile } from '../lib/storage';
import { getUserId } from '../lib/supabase';
import { Document } from '../types';

const CATEGORIES = ['Court Order', 'Agreement', 'Correspondence', 'Medical', 'Financial', 'Other'];
const CAT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Court Order': 'hammer', Agreement: 'document-text', Correspondence: 'mail',
  Medical: 'medical', Financial: 'cash', Other: 'folder',
};

const emptyForm = (): Partial<Document> => ({
  date: new Date().toISOString().split('T')[0],
  category: 'Court Order',
});

export default function DocumentVaultScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<Document>('document');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Document>>(emptyForm());
  const [uploading, setUploading] = useState(false);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(item: SavedRecord<Document>) {
    const { id, created_at, ...rest } = item;
    setEditingId(id);
    setForm(rest);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setUploading(false);
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    setUploading(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Not signed in', 'Please sign in again to attach files.');
        return;
      }
      const path = attachmentPath(userId, editingId ?? 'vault', file.name);
      const { error } = await uploadEncryptedFile(file.uri, path);
      if (error) { Alert.alert('Upload failed', error.message); return; }
      setForm(f => ({ ...f, file_path: path, file_name: file.name, mime_type: file.mimeType ?? 'application/octet-stream' }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (uploading) return;
    if (!form.title?.trim()) { Alert.alert('Add a title', 'Give this document a title so you can find it later.'); return; }
    setSaving(true);
    const payload = {
      title: form.title ?? '',
      category: form.category ?? 'Other',
      date: form.date || new Date().toISOString().split('T')[0],
      notes: form.notes ?? '',
      file_path: form.file_path ?? '',
      file_name: form.file_name ?? '',
      mime_type: form.mime_type ?? '',
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
      <ScreenHeader title="Document Vault" />
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={!loading ? <EmptyState icon="folder-open-outline" title="Vault is empty" subtitle="Upload encrypted documents. Only you can decrypt them." actionLabel="Upload a document" onAction={openNew} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={CAT_ICONS[item.category] ?? 'document'} size={20} color="#4f46e5" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.category} · {item.date}</Text>
              {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
              {item.file_path ? <AttachmentList paths={[item.file_path]} /> : null}
            </View>
            <RecordActions onEdit={() => openEdit(item)} onDelete={() => remove(item.id)} />
          </View>
        )}
      />
      <FAB onPress={openNew} color="#3b82f6" />
      <FormModal visible={modalOpen} title={editingId ? 'Edit Document' : 'Add Document'} onClose={closeModal} onSave={handleSave} saving={saving} uploading={uploading}>
        <Field label="Title *"><TextInput style={inputStyle} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Temporary Custody Order" /></Field>
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="Category">
          <View style={styles.chips}>{CATEGORIES.map(c => <Chip key={c} label={c} selected={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} />)}</View>
        </Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="Additional notes..." multiline /></Field>
        <Field label="File">
          <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument} disabled={uploading}>
            <Ionicons name="cloud-upload-outline" size={20} color="#4f46e5" />
            <Text style={styles.uploadText}>{uploading ? 'Encrypting & uploading…' : form.file_name ? form.file_name : 'Choose file to upload'}</Text>
          </TouchableOpacity>
          {form.file_path ? <AttachmentList paths={[form.file_path]} /> : null}
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
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  notes: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  uploadText: { fontSize: 14, color: '#4f46e5', fontWeight: '600', flex: 1 },
});
