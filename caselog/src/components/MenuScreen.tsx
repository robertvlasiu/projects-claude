import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface MenuItem {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  screen: string;
}

type Props = {
  title: string;
  subtitle: string;
  items: MenuItem[];
  navigation: any;
};

export default function MenuScreen({ title, subtitle, items, navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 16 }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.list}>
        {items.map(item => (
          <TouchableOpacity key={item.label} style={styles.card} onPress={() => navigation.navigate(item.screen)}>
            <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingBottom: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: '800', color: '#1e1b4b', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  list: { padding: 20, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1e1b4b', marginBottom: 2 },
  cardDesc: { fontSize: 12, color: '#94a3b8' },
});
