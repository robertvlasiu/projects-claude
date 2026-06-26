import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AttachmentPicker from '../components/AttachmentPicker';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { requestNotificationPermissions, scheduleEventNotification } from '../lib/notifications';
import { CustodyEvent } from '../types';

const EVENT_TYPES = ['Scheduled', 'Handoff', 'Violation', 'Makeup', 'Other'];
const TYPE_COLORS: Record<string, string> = { Scheduled: '#4f46e5', Handoff: '#10b981', Violation: '#ef4444', Makeup: '#f97316', Other: '#64748b' };

export default function CustodyCalendarScreen({ navigation }: any) {
  const { records, loading, add, remove } = useRecords<CustodyEvent>('custody_event');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState<Partial<CustodyEvent>>({ with_parent: 'me', type: 'Scheduled', status: 'scheduled', attachment_paths: [] });

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    records.forEach(r => {
      marks[r.date] = { marked: true, dotColor: TYPE_COLORS[r.type] ?? '#4f46e5', selected: r.date === selectedDate, selectedColor: '#eef2ff', selectedTextColor: '#4f46e5' };
    });
    if (selectedDate && !marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: '#eef2ff', selectedTextColor: '#4f46e5' };
    }
    return marks;
  }, [records, selectedDate]);

  const dayRecords = selectedDate ? records.filter(r => r.date === selectedDate) : records;

  async function handleSave() {
    if (!form.date?.trim()) { Alert.alert('Required', 'Please select a date.'); return; }
    setSaving(true);
    await add({ date: form.date ?? '', type: form.type ?? 'Scheduled', notes: form.notes ?? '', with_parent: form.with_parent ?? 'me', child_names: form.child_names ?? '', status: form.status ?? 'scheduled', attachment_paths: form.attachment_paths ?? [] });
    if (form.type !== 'Violation') {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleEventNotification(
          `Custody: ${form.type}`,
          `Tomorrow — ${form.child_names || 'custody day'} ${form.with_parent === 'me' ? 'with you' : 'with other party'}`,
          form.date!, undefined, 24
        );
      }
    }
    setSaving(false);
    setModalOpen(false);
    setForm({ with_parent: 'me', type: 'Scheduled', status: 'scheduled', attachment_paths: [] });
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Custody Calendar" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>More</Text>
      </TouchableOpacity>
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{ todayTextColor: '#4f46e5', selectedDayBackgroundColor: '#4f46e5', arrowColor: '#4f46e5', dotColor: '#4f46e5', textDayFontWeight: '600', textMonthFontWeight: '800', textDayHeaderFontWeight: '700' }}
        style={styles.calendar}
      />
      {selectedDate ? (
        <View style={styles.selectedRow}>
          <Text style={styles.selectedDate}>{selectedDate}</Text>
          <TouchableOpacity onPress={() => setSelectedDate('')}>
            <Text style={styles.clearDate}>Show all</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <FlatList
        data={dayRecords}
        keyExtractor={r => r.id}
        contentContainerStyle={[dayRecords.length === 0 ? styles.emptyContainer : styles.list, { paddingBottom: 100 }]}
        ListEmptyComponent={!loading ? <EmptyState icon="people-outline" title={selectedDate ? 'No events on this day' : 'No custody events yet'} subtitle="Track custody days, handoffs, and any schedule violations." /> : null}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.typeBar, { backgroundColor: TYPE_COLORS[item.type] ?? '#64748b' }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <Text style={styles.cardDate}>{item.date}</Text>
                <View style={[styles.badge, { backgroundColor: item.with_parent === 'me' ? '#ecfdf5' : '#fef2f2' }]}>
                  <Text style={[styles.badgeText, { color: item.with_parent === 'me' ? '#10b981' : '#ef4444' }]}>{item.with_parent === 'me' ? 'With Me' : 'With Other'}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => Alert.alert('Delete?', '', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) }])}>
                  <Ionicons name="trash-outline" size={14} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
              <Text style={styles.type}>{item.type}{item.child_names ? ` — ${item.child_names}` : ''}</Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
              {(item.attachment_paths?.length ?? 0) > 0 && <Text style={styles.attachBadge}>📎 {item.attachment_paths!.length} file(s)</Text>}
            </View>
          </View>
        )}
      />
      <FAB onPress={() => { setForm(f => ({ ...f, date: selectedDate || new Date().toISOString().split('T')[0] })); setModalOpen(true); }} color="#10b981" />

      <FormModal visible={modalOpen} title="Add Custody Event" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
        <Field label="Date"><TextInput style={inputStyle} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" /></Field>
        <Field label="Type">
          <View style={styles.chips}>{EVENT_TYPES.map(t => <Chip key={t} label={t} selected={form.type === t} onPress={() => setForm(f => ({ ...f, type: t }))} color={TYPE_COLORS[t]} />)}</View>
        </Field>
        <Field label="With">
          <View style={styles.chips}>
            <Chip label="With Me" selected={form.with_parent === 'me'} onPress={() => setForm(f => ({ ...f, with_parent: 'me' }))} color="#10b981" />
            <Chip label="With Other Party" selected={form.with_parent === 'other'} onPress={() => setForm(f => ({ ...f, with_parent: 'other' }))} color="#ef4444" />
          </View>
        </Field>
        <Field label="Child(ren)"><TextInput style={inputStyle} value={form.child_names} onChangeText={v => setForm(f => ({ ...f, child_names: v }))} placeholder="Child names" /></Field>
        <Field label="Notes"><TextInput style={textAreaStyle} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} placeholder="Details, violations, issues..." multiline /></Field>
        <Field label="Attachments">
          <AttachmentPicker paths={form.attachment_paths ?? []} onChange={paths => setForm(f => ({ ...f, attachment_paths: paths }))} />
        </Field>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  calendar: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  selectedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  selectedDate: { fontSize: 14, fontWeight: '700', color: '#1e1b4b' },
  clearDate: { fontSize: 13, color: '#4f46e5' },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', overflow: 'hidden', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  typeBar: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardDate: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  type: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  notes: { fontSize: 13, color: '#64748b' },
  attachBadge: { fontSize: 12, color: '#94a3b8' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
