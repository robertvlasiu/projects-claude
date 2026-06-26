import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AttachmentPicker from '../components/AttachmentPicker';
import Chip from '../components/Chip';
import DateField from '../components/DateField';
import EmptyState from '../components/EmptyState';
import FAB from '../components/FAB';
import FormModal, { Field, inputStyle, textAreaStyle } from '../components/FormModal';
import ScreenHeader from '../components/ScreenHeader';
import { useRecords } from '../hooks/useRecords';
import { CustodyPattern, generateCustodyDates, WEEKDAY_LABELS } from '../lib/custodyPatterns';
import { requestNotificationPermissions, scheduleEventNotification } from '../lib/notifications';
import { CustodyEvent } from '../types';

const EVENT_TYPES = ['Scheduled', 'Handoff', 'Violation', 'Makeup', 'Other'];
const TYPE_COLORS: Record<string, string> = { Scheduled: '#4f46e5', Handoff: '#10b981', Violation: '#ef4444', Makeup: '#f97316', Other: '#64748b' };

type RepeatKind = 'weekdays' | 'nth_weekends' | 'alternating_weekends';
const ORDINALS = [{ v: 1, label: '1st' }, { v: 2, label: '2nd' }, { v: 3, label: '3rd' }, { v: 4, label: '4th' }, { v: 5, label: 'Last' }];
const MONTH_OPTIONS = [1, 3, 6, 12];

export default function CustodyCalendarScreen({ navigation }: any) {
  const { records, loading, add, addMany, remove } = useRecords<CustodyEvent>('custody_event');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState<Partial<CustodyEvent>>({ with_parent: 'me', type: 'Scheduled', status: 'scheduled', attachment_paths: [] });

  // ── Recurring schedule builder ──────────────────────────────────
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [repeatSaving, setRepeatSaving] = useState(false);
  const [repeatKind, setRepeatKind] = useState<RepeatKind>('weekdays');
  const [repeatWeekdays, setRepeatWeekdays] = useState<number[]>([]);
  const [repeatOrdinals, setRepeatOrdinals] = useState<number[]>([1, 2]);
  const [repeatFriday, setRepeatFriday] = useState(false);
  const [repeatAnchor, setRepeatAnchor] = useState('');
  const [repeatParent, setRepeatParent] = useState<'me' | 'other'>('me');
  const [repeatChildren, setRepeatChildren] = useState('');
  const [repeatMonths, setRepeatMonths] = useState(3);

  function buildPattern(): CustodyPattern | null {
    if (repeatKind === 'weekdays') {
      if (repeatWeekdays.length === 0) return null;
      return { kind: 'weekdays', weekdays: repeatWeekdays };
    }
    if (repeatKind === 'nth_weekends') {
      if (repeatOrdinals.length === 0) return null;
      return { kind: 'nth_weekends', ordinals: repeatOrdinals, includeFriday: repeatFriday };
    }
    if (!repeatAnchor) return null;
    return { kind: 'alternating_weekends', anchorSaturday: repeatAnchor, includeFriday: repeatFriday };
  }

  const previewCount = useMemo(() => {
    const pattern = buildPattern();
    if (!pattern) return 0;
    return generateCustodyDates(pattern, new Date().toISOString().split('T')[0], repeatMonths).length;
  }, [repeatKind, repeatWeekdays, repeatOrdinals, repeatFriday, repeatAnchor, repeatMonths]);

  async function handleSaveRepeat() {
    const pattern = buildPattern();
    if (!pattern) { Alert.alert('Choose a pattern', 'Pick at least one day or weekend for the schedule.'); return; }
    const dates = generateCustodyDates(pattern, new Date().toISOString().split('T')[0], repeatMonths);
    if (dates.length === 0) { Alert.alert('Nothing to add', 'That pattern produced no dates in the selected range.'); return; }
    setRepeatSaving(true);
    const events: CustodyEvent[] = dates.map(date => ({
      date, type: 'Scheduled', notes: 'Recurring schedule',
      with_parent: repeatParent, child_names: repeatChildren, status: 'scheduled', attachment_paths: [],
    }));
    const saved = await addMany(events);
    setRepeatSaving(false);
    if (saved === 0) { Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
    setRepeatOpen(false);
    Alert.alert('Schedule added', `${saved} custody day${saved === 1 ? '' : 's'} added to your calendar.`);
  }

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
    if (!form.date?.trim()) { Alert.alert('Pick a date', 'Choose the day this custody event happens.'); return; }
    setSaving(true);
    const id = await add({ date: form.date ?? '', type: form.type ?? 'Scheduled', notes: form.notes ?? '', with_parent: form.with_parent ?? 'me', child_names: form.child_names ?? '', status: form.status ?? 'scheduled', attachment_paths: form.attachment_paths ?? [] });
    if (!id) { setSaving(false); Alert.alert('Could not save', 'Something went wrong. Check your connection and try again.'); return; }
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
      <ScreenHeader
        title="Custody Calendar"
        right={
          <TouchableOpacity style={styles.repeatBtn} onPress={() => setRepeatOpen(true)}>
            <Ionicons name="repeat" size={16} color="#4f46e5" />
            <Text style={styles.repeatBtnText}>Repeat</Text>
          </TouchableOpacity>
        }
      />
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
        <Field label="Date"><DateField value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
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

      <FormModal
        visible={repeatOpen}
        title="Repeating Schedule"
        onClose={() => setRepeatOpen(false)}
        onSave={handleSaveRepeat}
        saving={repeatSaving}
        saveLabel={previewCount > 0 ? `Add ${previewCount} day${previewCount === 1 ? '' : 's'}` : 'Add to calendar'}
      >
        <Text style={styles.repeatIntro}>Set your custody days once and we&apos;ll fill in the calendar ahead.</Text>

        <Field label="These days are">
          <View style={styles.chips}>
            <Chip label="With Me" selected={repeatParent === 'me'} onPress={() => setRepeatParent('me')} color="#10b981" />
            <Chip label="With Other Party" selected={repeatParent === 'other'} onPress={() => setRepeatParent('other')} color="#ef4444" />
          </View>
        </Field>

        <Field label="Pattern">
          <View style={styles.chips}>
            <Chip label="Specific weekdays" selected={repeatKind === 'weekdays'} onPress={() => setRepeatKind('weekdays')} />
            <Chip label="Weekends of month" selected={repeatKind === 'nth_weekends'} onPress={() => setRepeatKind('nth_weekends')} />
            <Chip label="Alternating weekends" selected={repeatKind === 'alternating_weekends'} onPress={() => setRepeatKind('alternating_weekends')} />
          </View>
        </Field>

        {repeatKind === 'weekdays' && (
          <Field label="Which days each week?">
            <View style={styles.chips}>
              {WEEKDAY_LABELS.map((label, i) => (
                <Chip
                  key={label}
                  label={label}
                  selected={repeatWeekdays.includes(i)}
                  onPress={() => setRepeatWeekdays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])}
                />
              ))}
            </View>
          </Field>
        )}

        {repeatKind === 'nth_weekends' && (
          <>
            <Field label="Which weekends each month?">
              <View style={styles.chips}>
                {ORDINALS.map(o => (
                  <Chip
                    key={o.v}
                    label={o.label}
                    selected={repeatOrdinals.includes(o.v)}
                    onPress={() => setRepeatOrdinals(d => d.includes(o.v) ? d.filter(x => x !== o.v) : [...d, o.v])}
                  />
                ))}
              </View>
            </Field>
            <Field label="Weekend length">
              <View style={styles.chips}>
                <Chip label="Sat & Sun" selected={!repeatFriday} onPress={() => setRepeatFriday(false)} />
                <Chip label="Fri–Sun" selected={repeatFriday} onPress={() => setRepeatFriday(true)} />
              </View>
            </Field>
          </>
        )}

        {repeatKind === 'alternating_weekends' && (
          <>
            <Field label="A Saturday you have them (anchor)">
              <DateField value={repeatAnchor} onChange={setRepeatAnchor} placeholder="Pick a Saturday" />
            </Field>
            <Field label="Weekend length">
              <View style={styles.chips}>
                <Chip label="Sat & Sun" selected={!repeatFriday} onPress={() => setRepeatFriday(false)} />
                <Chip label="Fri–Sun" selected={repeatFriday} onPress={() => setRepeatFriday(true)} />
              </View>
            </Field>
          </>
        )}

        <Field label="Children (optional)">
          <TextInput style={inputStyle} value={repeatChildren} onChangeText={setRepeatChildren} placeholder="Child names" />
        </Field>

        <Field label="Generate for">
          <View style={styles.chips}>
            {MONTH_OPTIONS.map(m => (
              <Chip key={m} label={`${m} mo`} selected={repeatMonths === m} onPress={() => setRepeatMonths(m)} />
            ))}
          </View>
        </Field>

        <Text style={styles.repeatPreview}>
          {previewCount > 0 ? `This adds ${previewCount} custody day${previewCount === 1 ? '' : 's'}.` : 'Pick a pattern to preview.'}
        </Text>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  repeatBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  repeatBtnText: { fontSize: 13, color: '#4f46e5', fontWeight: '700' },
  repeatIntro: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  repeatPreview: { fontSize: 13, color: '#4f46e5', fontWeight: '600', textAlign: 'center', marginTop: 4 },
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
