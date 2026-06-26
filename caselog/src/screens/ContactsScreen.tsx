import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FormModal, { Field, inputStyle } from '../components/FormModal';
import FAB from '../components/FAB';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { Contact } from '../types';

const ROLES = ['Attorney', 'Mediator', 'Judge', 'Therapist', 'School', 'Doctor', 'Financial Advisor', 'Other'];
const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Attorney: 'briefcase', Mediator: 'people', Judge: 'hammer', Therapist: 'heart',
  School: 'school', Doctor: 'medical', 'Financial Advisor': 'cash', Other: 'person',
};
const ROLE_COLORS: Record<string, string> = {
  Attorney: '#4f46e5', Mediator: '#8b5cf6', Judge: '#ec4899', Therapist: '#f43f5e',
  School: '#10b981', Doctor: '#ef4444', 'Financial Advisor': '#f59e0b', Other: '#64748b',
};

export default function ContactsScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<Contact>('contact');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>({ role: 'Attorney' });

  async function handleSave() {
    if (!form.name?.trim()) { Alert.alert('Required', 'Name is required.'); return; }
    setSaving(true);
    await add({ name: form.name ?? '', role: form.role ?? 'Other', phone: form.phone ?? '', email: form.email ?? '', address: form.address ?? '', firm: form.firm ?? '', notes: form.notes ?? '' });
    setSaving(false);
    setModalOpen(false);
    setForm({ role: 'Attorney' });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Contacts" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>More</Text>
      </TouchableOpacity>
      <FlatList
        data={records}
        keyExtractor={r => r.id}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={!loading ? <EmptyState icon="people-outline" title="No contacts yet" subtitle="Store your attorney, mediator, therapist and more." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: (ROLE_COLORS[item.role] ?? '#64748b') + '20' }]}>
              <Ionicons name={ROLE_ICONS[item.role] ?? 'person'} size={20} color={ROLE_COLORS[item.role] ?? '#64748b'} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardRole}>{item.role}{item.firm ? ` · ${item.firm}` : ''}</Text>
            </View>
            <View style={styles.actions}>
              {item.phone ? (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                  <Ionicons name="call-outline" size={18} color="#4f46e5" />
                </TouchableOpacity>
              ) : null}
              {item.email ? (
                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${item.email}`)}>
                  <Ionicons name="mail-outline" size={18} color="#4f46e5" />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                <Ionicons name="trash-outline" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <FAB onPress={() => setModalOpen(true)} color="#0ea5e9" />
      <FormModal visible={modalOpen} title="New Contact" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Role">
          <View style={styles.chips}>{ROLES.map(r => <Chip key={r} label={r} selected={form.role === r} onPress={() => setForm(f => ({ ...f, role: r }))} color={ROLE_COLORS[r]} />)}</View>
        </Field>
        <Field label="Name *"><TextInput style={inputStyle} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Full name" /></Field>
        <Field label="Firm / Organization"><TextInput style={inputStyle} value={form.firm} onChangeText={v => setForm(f => ({ ...f, firm: v }))} placeholder="Law firm, school, clinic..." /></Field>
        <Field label="Phone"><TextInput style={inputStyle} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 555 000 0000" keyboardType="phone-pad" /></Field>
        <Field label="Email"><TextInput style={inputStyle} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" /></Field>
        <Field label="Address"><TextInput style={inputStyle} value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} placeholder="Office address" /></Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  cardRole: { fontSize: 12, color: '#94a3b8' },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
