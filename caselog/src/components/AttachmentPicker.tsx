import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { attachmentPath, uploadEncryptedFile } from '../lib/storage';
import { supabase } from '../lib/supabase';

type Props = {
  paths: string[];
  onChange: (paths: string[]) => void;
  recordId?: string;
};

export default function AttachmentPicker({ paths, onChange, recordId = 'temp' }: Props) {
  const [busy, setBusy] = useState(false);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow photo access to attach images.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    await upload(result.assets[0].uri, result.assets[0].fileName ?? result.assets[0].uri.split('/').pop() ?? 'image.jpg');
  }

  async function pickDoc() {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    await upload(asset.uri, asset.name);
  }

  async function upload(uri: string, name: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { Alert.alert('Not signed in', 'Please sign in again to attach files.'); return; }
    setBusy(true);
    const path = attachmentPath(user.id, recordId, name);
    const { error } = await uploadEncryptedFile(uri, path);
    setBusy(false);
    if (error) { Alert.alert('Upload failed', error.message || 'Could not upload the file. Try again.'); return; }
    onChange([...paths, path]);
  }

  function remove(path: string) {
    onChange(paths.filter(p => p !== path));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, busy && styles.btnDisabled]} onPress={pickImage} disabled={busy}>
          <Ionicons name="image-outline" size={16} color="#4f46e5" />
          <Text style={styles.btnText}>Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, busy && styles.btnDisabled]} onPress={pickDoc} disabled={busy}>
          <Ionicons name="document-outline" size={16} color="#4f46e5" />
          <Text style={styles.btnText}>File</Text>
        </TouchableOpacity>
      </View>
      {busy && (
        <View style={styles.busyRow}>
          <ActivityIndicator size="small" color="#4f46e5" />
          <Text style={styles.busyText}>Encrypting &amp; uploading…</Text>
        </View>
      )}
      {paths.map((p, i) => (
        <View key={i} style={styles.file}>
          <Ionicons name="attach" size={14} color="#94a3b8" />
          <Text style={styles.fileName} numberOfLines={1}>{(p.split('/').pop() ?? '').replace(/^\d+-/, '')}</Text>
          <TouchableOpacity onPress={() => remove(p)}>
            <Ionicons name="close-circle" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed', backgroundColor: '#fafbff' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 13, color: '#4f46e5', fontWeight: '600' },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  busyText: { fontSize: 12, color: '#64748b' },
  file: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', borderRadius: 8, padding: 8 },
  fileName: { flex: 1, fontSize: 12, color: '#64748b' },
});
