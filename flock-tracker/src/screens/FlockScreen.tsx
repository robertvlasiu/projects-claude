import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore, FREE_BIRD_LIMIT_EXPORT } from '../store';
import { colors, spacing, radius, font } from '../constants/theme';
import BirdCard from '../components/BirdCard';
import { RootStackParamList } from '../types';
import { toDateKey } from '../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FlockScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { birds, eggLogs, healthRecords, isPremium } = useStore();
  const [showInactive, setShowInactive] = useState(false);

  const today = toDateKey();
  const todayLog = eggLogs.find((l) => l.date === today);

  const lastHealthByBird: Record<string, string> = {};
  healthRecords.forEach((r) => {
    if (!lastHealthByBird[r.birdId]) {
      lastHealthByBird[r.birdId] = r.type;
    }
  });

  const visible = showInactive ? birds : birds.filter((b) => b.isActive);
  const atLimit = !isPremium && birds.length >= FREE_BIRD_LIMIT_EXPORT;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>My Flock</Text>
        <TouchableOpacity
          style={[styles.addBtn, atLimit && styles.addBtnDisabled]}
          onPress={() => {
            if (atLimit) return;
            navigation.navigate('AddBird', {});
          }}
          disabled={atLimit}
        >
          <Text style={styles.addBtnText}>+ Add Bird</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle inactive */}
      <View style={styles.filterRow}>
        <Text style={styles.countText}>
          {visible.length} bird{visible.length !== 1 ? 's' : ''} · {birds.filter(b => b.sex === 'hen' && b.isActive).length} hens
        </Text>
        <TouchableOpacity onPress={() => setShowInactive(!showInactive)}>
          <Text style={styles.toggleText}>
            {showInactive ? 'Hide inactive' : 'Show inactive'}
          </Text>
        </TouchableOpacity>
      </View>

      {atLimit && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitText}>
            Free plan: {FREE_BIRD_LIMIT_EXPORT} birds max. Upgrade for unlimited flock tracking →
          </Text>
        </View>
      )}

      <FlatList
        data={visible}
        keyExtractor={(b) => b.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BirdCard
            bird={item}
            onPress={() => navigation.navigate('BirdDetail', { birdId: item.id })}
            eggCountToday={todayLog?.count}
            lastHealthType={lastHealthByBird[item.id]}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐣</Text>
            <Text style={styles.emptyTitle}>No birds yet</Text>
            <Text style={styles.emptyText}>Add your first bird to get started.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddBird', {})}
            >
              <Text style={styles.emptyBtnText}>Add First Bird</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  addBtnDisabled: { backgroundColor: colors.textMuted },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  countText: { fontSize: font.sm, color: colors.textMuted },
  toggleText: { fontSize: font.sm, color: colors.primary, fontWeight: '600' },
  limitBanner: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  limitText: { fontSize: font.sm, color: colors.primaryDark, fontWeight: '500' },
  row: { justifyContent: 'space-between' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  emptyText: { fontSize: font.md, color: colors.textMuted, marginBottom: spacing.xl },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: font.md },
});
