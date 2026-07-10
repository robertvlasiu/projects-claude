import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import AttachmentList from '../components/AttachmentList';
import AttachmentPicker from '../components/AttachmentPicker';
import Chip from '../components/Chip';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle } from '../components/FormModal';
import RecordActions from '../components/RecordActions';
import ScreenHeader from '../components/ScreenHeader';
import { SavedRecord, useRecords } from '../hooks/useRecords';
import { Expense } from '../types';

const CATEGORIES = ['Legal', 'Medical', 'Childcare', 'Housing', 'Transport', 'Other'];
const CAT_COLORS: Record<string, string> = { Legal: '#4f46e5', Medical: '#ef4444', Childcare: '#8b5cf6', Housing: '#f59e0b', Transport: '#0ea5e9', Other: '#64748b' };

const emptyForm = (): Partial<Expense> => ({
  date: new Date().toISOString().split('T')[0],
  category: 'Legal',
  attachment_paths: [],
});

export default function ExpenseTrackerScreen({ navigation }: any) {
  const { records, loading, add, update, remove } = useRecords<Expense>('expense');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Expense>>(emptyForm());

  const totalExpenses = records.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(item: SavedRecord<Expense>) {
    const { id, created_at, ...rest } = item;
    setEditingId(id);
    setForm({ ...rest, attachment_paths: rest.attachment_paths ?? [] });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setUploading(false);
  }

  async function handleSave() {
    if (uploading) return;
    if (!form.amount?.trim()) { Alert.alert('Add an amount', 'Enter how much this cost.'); return; }
    setSaving(true);
    const payload = {
      date: form.date || new Date().toISOString().split('T')[0],
      amount: form.amount ?? '',
      category: form.category ?? 'Other',
      description: form.description ?? '',
      vendor: form.vendor ?? '',
      receipt_path: form.receipt_path ?? '',
      attachment_paths: form.attachment_paths ?? [],
    };
    if (editingId) {
      await update(editingId, payload);
      setSaving(false);
      closeModal();
      return;
    }
    const id = await add(payload);
    setSaving(false);
    if (!id) { Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
    closeModal();
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
        ListEmptyComponent={!loading ? <EmptyState icon="receipt-outline" title="No expenses yet" subtitle="Track legal fees, child costs, and shared bills. All data is encrypted." actionLabel="Add an expense" onAction={openNew} /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.catDot, { backgroundColor: CAT_COLORS[item.category] ?? '#64748b' }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardMeta}>{item.date} · {item.vendor || item.category}</Text>
              {(item.attachment_paths?.length ?? 0) > 0 && (
                <AttachmentList paths={item.attachment_paths!} />
              )}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>${parseFloat(item.amount || '0').toFixed(2)}</Text>
              <RecordActions onEdit={() => openEdit(item)} onDelete={() => remove(item.id)} iconSize={15} />
            </View>
          </View>
        )}
      />
      <FAB onPress={openNew} color="#f59e0b" />

      <FormModal visible={modalOpen} title={editingId ? 'Edit Expense' : 'New Expense'} onClose={closeModal} onSave={handleSave} saving={saving} uploading={uploading}>
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
        <Field label="Amount ($) *"><TextInput style={inputStyle} value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} placeholder="0.00" keyboardType="decimal-pad" /></Field>
        <Field label="Category">
          <View style={styles.chips}>{CATEGORIES.map(c => <Chip key={c} label={c} selected={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} color={CAT_COLORS[c]} />)}</View>
        </Field>
        <Field label="Description"><TextInput style={inputStyle} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="What was this for?" /></Field>
        <Field label="Vendor / Payee"><TextInput style={inputStyle} value={form.vendor} onChangeText={v => setForm(f => ({ ...f, vendor: v }))} placeholder="Attorney, hospital, daycare..." /></Field>
        <Field label="Receipts">
          <AttachmentPicker paths={form.attachment_paths ?? []} onChange={paths => setForm(f => ({ ...f, attachment_paths: paths }))} recordId={editingId ?? 'temp'} onUploadingChange={setUploading} />
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
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  catDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  cardBody: { flex: 1, gap: 2 },
  cardDesc: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  cardMeta: { fontSize: 12, color: '#94a3b8' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardAmount: { fontSize: 16, fontWeight: '800', color: '#1e1b4b' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
