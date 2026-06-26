import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AttachmentPicker from '../components/AttachmentPicker';
import Chip from '../components/Chip';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle } from '../components/FormModal';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { Expense } from '../types';

const CATEGORIES = ['Legal', 'Medical', 'Childcare', 'Housing', 'Transport', 'Other'];
const CAT_COLORS: Record<string, string> = { Legal: '#4f46e5', Medical: '#ef4444', Childcare: '#8b5cf6', Housing: '#f59e0b', Transport: '#0ea5e9', Other: '#64748b' };

export default function ExpenseTrackerScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<Expense>('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({ date: new Date().toISOString().split('T')[0], category: 'Legal', attachment_paths: [] });

  const totalExpenses = records.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

  async function handleSave() {
    if (!form.amount?.trim()) { Alert.alert('Add an amount', 'Enter how much this cost.'); return; }
    setSaving(true);
    const id = await add({ date: form.date || new Date().toISOString().split('T')[0], amount: form.amount ?? '', category: form.category ?? 'Other', description: form.description ?? '', vendor: form.vendor ?? '', receipt_path: '', attachment_paths: form.attachment_paths ?? [] });
    setSaving(false);
    if (!id) { Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
    setModalOpen(false);
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Legal', attachment_paths: [] });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Expenses" />

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Logged</Text>
        <Text style={styles.totalValue}>${totalExpenses.toFixed(2)}</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={[records.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="receipt-outline" title="No expenses yet" subtitle="Tap + to log your first expense. All data is encrypted." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.catDot, { backgroundColor: CAT_COLORS[item.category] ?? '#64748b' }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardMeta}>{item.date} · {item.vendor || item.category}</Text>
              {(item.attachment_paths?.length ?? 0) > 0 && <Text style={styles.attachBadge}>📎 {item.attachment_paths!.length} receipt(s)</Text>}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>${parseFloat(item.amount || '0').toFixed(2)}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                <Ionicons name="trash-outline" size={15} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#f59e0b" />

      <FormModal visible={modalOpen} title="New Expense" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="Amount ($) *"><TextInput style={inputStyle} value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} placeholder="0.00" keyboardType="decimal-pad" /></Field>
        <Field label="Category">
          <View style={styles.chips}>{CATEGORIES.map(c => <Chip key={c} label={c} selected={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} color={CAT_COLORS[c]} />)}</View>
        </Field>
        <Field label="Description"><TextInput style={inputStyle} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="What was this for?" /></Field>
        <Field label="Vendor / Payee"><TextInput style={inputStyle} value={form.vendor} onChangeText={v => setForm(f => ({ ...f, vendor: v }))} placeholder="Attorney, hospital, daycare..." /></Field>
        <Field label="Receipts">
          <AttachmentPicker paths={form.attachment_paths ?? []} onChange={paths => setForm(f => ({ ...f, attachment_paths: paths }))} />
        </Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  totalCard: { margin: 16, padding: 20, backgroundColor: '#fff7ed', borderRadius: 16 },
  totalLabel: { fontSize: 12, color: '#f97316', fontWeight: '600', marginBottom: 4 },
  totalValue: { fontSize: 32, fontWeight: '800', color: '#f97316', letterSpacing: -1 },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  cardBody: { flex: 1, gap: 2 },
  cardDesc: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  attachBadge: { fontSize: 11, color: '#64748b' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardAmount: { fontSize: 16, fontWeight: '800', color: '#1e1b4b' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
