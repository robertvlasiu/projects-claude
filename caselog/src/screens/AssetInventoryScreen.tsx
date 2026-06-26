import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import FAB from '../components/FAB';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { Asset, AssetOwner, AssetType } from '../types';

const CATEGORIES = ['Real Estate', 'Vehicle', 'Bank Account', 'Retirement', 'Business', 'Personal Property', 'Debt', 'Other'];
const OWNER_COLORS: Record<AssetOwner, string> = { joint: '#4f46e5', mine: '#10b981', theirs: '#ef4444' };

export default function AssetInventoryScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<Asset>('asset');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Asset>>({ asset_type: 'asset', owner: 'joint', category: 'Real Estate' });

  const totalAssets = records.filter(r => r.asset_type === 'asset').reduce((s, r) => s + parseFloat(r.estimated_value || '0'), 0);
  const totalDebts = records.filter(r => r.asset_type === 'debt').reduce((s, r) => s + parseFloat(r.estimated_value || '0'), 0);

  async function handleSave() {
    if (!form.name?.trim()) { Alert.alert('Required', 'Name is required.'); return; }
    setSaving(true);
    await add({ name: form.name ?? '', category: form.category ?? 'Other', asset_type: form.asset_type ?? 'asset', estimated_value: form.estimated_value ?? '0', owner: form.owner ?? 'joint', notes: form.notes ?? '' });
    setSaving(false);
    setModalOpen(false);
    setForm({ asset_type: 'asset', owner: 'joint', category: 'Real Estate' });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Asset & Debt Inventory" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>Finance</Text>
      </TouchableOpacity>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#ecfdf5' }]}>
          <Text style={styles.summaryLabel}>Total Assets</Text>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>${totalAssets.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.summaryLabel}>Total Debts</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>${totalDebts.toLocaleString()}</Text>
        </View>
      </View>
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={!loading ? <EmptyState icon="home-outline" title="No assets or debts logged" subtitle="Catalog everything that will be divided in the settlement." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.typeBadge, { backgroundColor: item.asset_type === 'asset' ? '#ecfdf5' : '#fef2f2' }]}>
              <Ionicons name={item.asset_type === 'asset' ? 'trending-up' : 'trending-down'} size={16} color={item.asset_type === 'asset' ? '#10b981' : '#ef4444'} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMeta}>{item.category}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.cardValue, { color: item.asset_type === 'asset' ? '#10b981' : '#ef4444' }]}>${parseFloat(item.estimated_value || '0').toLocaleString()}</Text>
              <View style={[styles.ownerBadge, { backgroundColor: OWNER_COLORS[item.owner] + '20' }]}>
                <Text style={[styles.ownerText, { color: OWNER_COLORS[item.owner] }]}>{item.owner}</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                <Ionicons name="trash-outline" size={14} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#14b8a6" />
      <FormModal visible={modalOpen} title="Add Asset / Debt" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Type">
          <View style={styles.chips}>
            <Chip label="Asset" selected={form.asset_type === 'asset'} onPress={() => setForm(f => ({ ...f, asset_type: 'asset' }))} color="#10b981" />
            <Chip label="Debt" selected={form.asset_type === 'debt'} onPress={() => setForm(f => ({ ...f, asset_type: 'debt' }))} color="#ef4444" />
          </View>
        </Field>
        <Field label="Name *"><TextInput style={inputStyle} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Family Home, Car Loan" /></Field>
        <Field label="Category">
          <View style={styles.chips}>{CATEGORIES.map(c => <Chip key={c} label={c} selected={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} />)}</View>
        </Field>
        <Field label="Estimated Value ($)"><TextInput style={inputStyle} value={form.estimated_value} onChangeText={v => setForm(f => ({ ...f, estimated_value: v }))} keyboardType="decimal-pad" placeholder="0" /></Field>
        <Field label="Ownership">
          <View style={styles.chips}>
            {(['joint', 'mine', 'theirs'] as AssetOwner[]).map(o => <Chip key={o} label={o.charAt(0).toUpperCase() + o.slice(1)} selected={form.owner === o} onPress={() => setForm(f => ({ ...f, owner: o }))} color={OWNER_COLORS[o]} />)}
          </View>
        </Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="Details, account numbers, location..." multiline /></Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  summaryRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 14 },
  summaryLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  typeBadge: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  cardValue: { fontSize: 15, fontWeight: '800' },
  ownerBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  ownerText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
