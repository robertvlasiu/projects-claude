import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  saveLabel?: string;
  children: React.ReactNode;
};

export default function FormModal({ visible, title, onClose, onSave, saving, saveLabel = 'Save', children }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.cancelBtn} />
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {/* Primary action sits at the bottom — within easy thumb reach, mirroring the + button. */}
        <View style={styles.footer}>
          <View style={styles.encRow}>
            <Ionicons name="lock-closed" size={12} color="#94a3b8" />
            <Text style={styles.encText}>Encrypted on your device before it&apos;s saved</Text>
          </View>
          <TouchableOpacity
            onPress={onSave}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveText}>{saveLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

export const inputStyle = {
  height: 48,
  backgroundColor: '#f8fafc',
  borderRadius: 12,
  paddingHorizontal: 14,
  fontSize: 15,
  color: '#1e293b',
  borderWidth: 1.5,
  borderColor: '#e2e8f0',
};

export const textAreaStyle = {
  ...inputStyle,
  height: 100,
  paddingTop: 12,
  textAlignVertical: 'top' as const,
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginTop: 10 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  cancelBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: '#1e1b4b' },
  body: { flex: 1 },
  bodyContent: { padding: 20, gap: 16 },
  footer: {
    paddingHorizontal: 20, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fff', gap: 10,
  },
  encRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  encText: { fontSize: 11, color: '#94a3b8' },
  saveBtn: {
    height: 52, borderRadius: 14, backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', letterSpacing: 0.3 },
});
