import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { attachmentDisplayName, getCachedAttachmentUri, isImageAttachment } from '../lib/storage';
import AttachmentViewerModal from './AttachmentViewerModal';

type Props = {
  paths: string[];
};

type LoadedFile = {
  path: string;
  uri: string | null;
  loading: boolean;
  error: boolean;
};

export default function AttachmentList({ paths }: Props) {
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState('');

  useEffect(() => {
    if (!paths.length) {
      setFiles([]);
      return;
    }
    setFiles(paths.map(path => ({ path, uri: null, loading: true, error: false })));
    let cancelled = false;
    paths.forEach(async (path, i) => {
      const { uri, error } = await getCachedAttachmentUri(path);
      if (cancelled) return;
      setFiles(prev => {
        const next = [...prev];
        if (next[i]?.path === path) {
          next[i] = { path, uri, loading: false, error: !!error || !uri };
        }
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [paths.join('|')]);

  async function openFile(file: LoadedFile) {
    if (file.loading) return;
    if (file.error || !file.uri) {
      Alert.alert('Could not open', 'Failed to decrypt or download this file. Try again.');
      return;
    }
    if (isImageAttachment(file.path)) {
      setViewerName(attachmentDisplayName(file.path));
      setViewerUri(file.uri);
      return;
    }
    try {
      await Linking.openURL(file.uri);
    } catch {
      Alert.alert('Could not open', 'No app on this device can open this file type.');
    }
  }

  if (!paths.length) return null;

  const images = files.filter(f => isImageAttachment(f.path));
  const docs = files.filter(f => !isImageAttachment(f.path));

  return (
    <View style={styles.wrap}>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
          {images.map(file => (
            <TouchableOpacity key={file.path} style={styles.thumbWrap} onPress={() => openFile(file)} activeOpacity={0.85}>
              {file.loading ? (
                <ActivityIndicator color="#4f46e5" />
              ) : file.error || !file.uri ? (
                <Ionicons name="alert-circle-outline" size={22} color="#ef4444" />
              ) : (
                <Image source={{ uri: file.uri }} style={styles.thumb} resizeMode="cover" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {docs.map(file => (
        <TouchableOpacity key={file.path} style={styles.fileRow} onPress={() => openFile(file)}>
          {file.loading ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : (
            <Ionicons name="document-outline" size={16} color="#4f46e5" />
          )}
          <Text style={styles.fileName} numberOfLines={1}>{attachmentDisplayName(file.path)}</Text>
          <Ionicons name="open-outline" size={14} color="#94a3b8" />
        </TouchableOpacity>
      ))}
      <AttachmentViewerModal
        visible={!!viewerUri}
        uri={viewerUri}
        name={viewerName}
        onClose={() => setViewerUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginTop: 8 },
  thumbRow: { gap: 8 },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumb: { width: 72, height: 72 },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileName: { flex: 1, fontSize: 13, color: '#475569', fontWeight: '500' },
});
