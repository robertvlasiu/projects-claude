import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SubPackage,
  getPackages,
  planDisplayInfo,
  purchase,
} from '../lib/subscription';

type Props = {
  onPurchased: () => void;
};

export default function SubscriptionPlans({ onPurchased }: Props) {
  const [packages, setPackages] = useState<SubPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    getPackages()
      .then(setPackages)
      .finally(() => setLoading(false));
  }, []);

  async function handlePurchase(pkg: SubPackage) {
    setBuying(pkg.id);
    const result = await purchase(pkg);
    setBuying(null);
    if (result === 'purchased') {
      onPurchased();
      return;
    }
    if (result !== 'cancelled') {
      Alert.alert('Purchase failed', typeof result === 'string' ? result : 'Try again in a moment.');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  if (!packages.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Subscription plans are unavailable right now. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {packages.map(pkg => {
        const { name, trialLine, priceLine } = planDisplayInfo(pkg);
        return (
          <TouchableOpacity
            key={pkg.id}
            style={styles.plan}
            onPress={() => handlePurchase(pkg)}
            disabled={!!buying}
            activeOpacity={0.85}
          >
            <View style={styles.planBody}>
              <View style={styles.trialPill}>
                <Text style={styles.trialPillText}>{trialLine}</Text>
              </View>
              <Text style={styles.planTitle}>{name}</Text>
              <Text style={styles.planPrice}>{priceLine}</Text>
            </View>
            {buying === pkg.id ? (
              <ActivityIndicator color="#4f46e5" size="small" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  center: { paddingVertical: 32, alignItems: 'center' },
  empty: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  emptyText: { fontSize: 13, color: '#64748b', lineHeight: 18, textAlign: 'center' },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planBody: { flex: 1, gap: 4 },
  trialPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 4,
  },
  trialPillText: { fontSize: 11, fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.3 },
  planTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  planPrice: { fontSize: 14, color: '#64748b', fontWeight: '500' },
});
