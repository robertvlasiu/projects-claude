import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import FAB from '../components/FAB';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { attachmentPath, uploadEncryptedFile } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { Document } from '../types';

const CATEGORIES = ['Court Order', 'Agreement', 'Correspondence', 'Medical', 'Financial', 'Other'];
const CAT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Court Order': 'hammer', Agreement: 'document-text', Correspondence: 'mail',
  Medical: 'medical', Financial: 'cash', Other: 'folder',
};

export default function DocumentVaultScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<Document>('document');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Document>>({ date: new Date().toISOString().split('T')[0], category: 'Court Order' });
  const [uploading, setUploading] = useState(false);

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled) return;
    const file = result.assets[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    const path = attachmentPath(user.id, 'vault', file.name);
    const { error } = await uploadEncryptedFile(file.uri, path);
    setUploading(false);
    if (error) { Alert.alert('Upload failed', error.message); return; }
    setForm(f => ({ ...f, file_path: path, file_name: file.name, mime_type: file.mimeType ?? 'application/octet-stream' }));
  }

  async function handleSave() {
    if (!form.title?.trim()) { Alert.alert('Required', 'Please add a title.'); return; }
    setSaving(true);
    await add({ title: form.title ?? '', category: form.category ?? 'Other', date: form.date ?? '', notes: form.notes ?? '', file_path: form.file_path ?? '', file_name: form.file_name ?? '', mime_type: form.mime_type ?? '' });
    setSaving(false);
    setModalOpen(false);
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Court Order' });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Document Vault" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>Legal</Text>
      </TouchableOpacity>
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={!loading ? <EmptyState icon="folder-open-outline" title="Vault is empty" subtitle="Upload encrypted documents. Only you can decrypt them." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={CAT_ICONS[item.category] ?? 'document'} size={20} color="#4f46e5" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.category} · {item.date}</Text>
              {item.file_name ? <Text style={styles.fileName}>📎 {item.file_name}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
              <Ionicons name="trash-outline" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#3b82f6" />
      <FormModal visible={modalOpen} title="Add Document" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Title *"><TextInput style={inputStyle} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Temporary Custody Order" /></Field>
        <Field label="Date"><TextInput style={inputStyle} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" /></Field>
        <Field label="Category">
          <View style={styles.chips}>{CATEGORIES.map(c => <Chip key={c} label={c} selected={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} />)}</View>
        </Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="Additional notes..." multiline /></Field>
        <Field label="File">
          <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument} disabled={uploading}>
            <Ionicons name="cloud-upload-outline" size={20} color="#4f46e5" />
            <Text style={styles.uploadText}>{uploading ? 'Encrypting & uploading…' : form.file_name ? form.file_name : 'Choose file to upload'}</Text>
          </TouchableOpacity>
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
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
  fileName: { fontSize: 12, color: '#4f46e5' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  uploadText: { fontSize: 14, color: '#4f46e5', fontWeight: '600', flex: 1 },
});
