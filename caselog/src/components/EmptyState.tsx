import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={36} color="#a5b4fc" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 48 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: '#eef2ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1e1b4b', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20,
    backgroundColor: '#4f46e5', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20,
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
