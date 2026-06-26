import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  /** 'YYYY-MM-DD' for date mode, 'HH:MM' for time mode. */
  value?: string;
  onChange: (value: string) => void;
  mode?: 'date' | 'time';
  placeholder?: string;
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseDate(value: string | undefined, mode: 'date' | 'time'): Date {
  const now = new Date();
  if (!value) return now;
  if (mode === 'time') {
    const [h, m] = value.split(':').map(Number);
    if (!isNaN(h)) now.setHours(h, m || 0, 0, 0);
    return now;
  }
  const [y, mo, d] = value.split('-').map(Number);
  if (!isNaN(y)) return new Date(y, (mo || 1) - 1, d || 1);
  return now;
}

function format(date: Date, mode: 'date' | 'time'): string {
  if (mode === 'time') return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function display(value: string | undefined, mode: 'date' | 'time'): string {
  if (!value) return '';
  if (mode === 'time') return value;
  const d = parseDate(value, mode);
  return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DateField({ value, onChange, mode = 'date', placeholder }: Props) {
  const [open, setOpen] = useState(false);

  function handleChange(_event: any, selected?: Date) {
    // On Android the picker is a one-shot dialog; close it after a pick/dismiss.
    if (Platform.OS === 'android') setOpen(false);
    if (selected) onChange(format(selected, mode));
  }

  return (
    <View>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <Ionicons name={mode === 'time' ? 'time-outline' : 'calendar-outline'} size={18} color="#94a3b8" />
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value ? display(value, mode) : (placeholder ?? (mode === 'time' ? 'Pick a time' : 'Pick a date'))}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#cbd5e1" />
      </TouchableOpacity>
      {open && (
        <DateTimePicker
          value={parseDate(value, mode)}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          themeVariant="light"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 48, backgroundColor: '#f8fafc', borderRadius: 12,
    paddingHorizontal: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  value: { flex: 1, fontSize: 15, color: '#1e293b' },
  placeholder: { color: '#aab4c4' },
});

