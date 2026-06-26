import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function ScreenHeader({ title, subtitle, right }: Props) {
  const navigation = useNavigation<any>();
  const canGoBack = navigation.canGoBack();

  return (
    <View style={styles.header}>
      {canGoBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#4f46e5" />
        </TouchableOpacity>
      ) : null}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  titleWrap: { flex: 1, paddingHorizontal: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e1b4b', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
});
