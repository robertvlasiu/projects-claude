import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  missing: string[];
};

export default function ConfigErrorScreen({ missing }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="warning-outline" size={48} color="#ef4444" />
        <Text style={styles.title}>App configuration missing</Text>
        <Text style={styles.body}>
          This build was compiled without required environment variables. The app cannot connect to
          your backend until a new build is made with EAS secrets configured.
        </Text>
        <Text style={styles.label}>Missing:</Text>
        {missing.map(key => (
          <Text key={key} style={styles.key}>
            {key}
          </Text>
        ))}
        <Text style={styles.hint}>
          Fix: run{' '}
          <Text style={styles.code}>eas env:push production</Text>
          {' '}with your .env file, then rebuild with{' '}
          <Text style={styles.code}>eas build --platform ios --profile production</Text>.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginTop: 8 },
  body: { fontSize: 15, color: '#64748b', lineHeight: 22, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: '#94a3b8', alignSelf: 'flex-start', marginTop: 8 },
  key: {
    alignSelf: 'stretch',
    fontFamily: 'Menlo',
    fontSize: 12,
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
  },
  hint: { fontSize: 13, color: '#64748b', lineHeight: 20, marginTop: 12 },
  code: { fontFamily: 'Menlo', fontSize: 11, color: '#4f46e5' },
});
