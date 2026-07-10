import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  uri: string | null;
  name?: string;
  onClose: () => void;
};

export default function AttachmentViewerModal({ visible, uri, name, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.header}>
          {name ? <Text style={styles.name} numberOfLines={1}>{name}</Text> : <View style={styles.name} />}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  name: { flex: 1, color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  closeBtn: { padding: 4 },
  image: { flex: 1, width: '100%' },
});
