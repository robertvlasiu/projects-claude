import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { decrypt } from '../lib/crypto';
import { supabase } from '../lib/supabase';

const EXPORT_TYPES = [
  { key: 'incident', label: 'Incident Log', icon: 'warning' as const, color: '#ef4444', bg: '#fef2f2' },
  { key: 'expense', label: 'Expense Report', icon: 'receipt' as const, color: '#f97316', bg: '#fff7ed' },
  { key: 'communication', label: 'Communication Log', icon: 'chatbubbles' as const, color: '#0ea5e9', bg: '#f0f9ff' },
  { key: 'court_date', label: 'Court Timeline', icon: 'calendar' as const, color: '#ec4899', bg: '#fdf2f8' },
  { key: 'attorney_note', label: 'Attorney Notes', icon: 'briefcase' as const, color: '#10b981', bg: '#ecfdf5' },
  { key: 'asset', label: 'Asset Inventory', icon: 'home' as const, color: '#f59e0b', bg: '#fffbeb' },
];

export default function ExportScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<string>('');

  function toggle(key: string) {
    setSelected(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key]);
    setPreview('');
  }

  async function handleExport() {
    if (selected.length === 0) { Alert.alert('Select at least one section to export.'); return; }
    setExporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setExporting(false); return; }
    const { data } = await supabase.from('records').select('type, encrypted_data, created_at').eq('user_id', user.id).in('type', selected).order('created_at', { ascending: false });
    if (!data) { setExporting(false); return; }

    let text = `AURIS CASE REPORT\nGenerated: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
    for (const type of selected) {
      const label = EXPORT_TYPES.find(e => e.key === type)?.label ?? type;
      const records = data.filter(d => d.type === type);
      text += `${label.toUpperCase()} (${records.length} entries)\n${'-'.repeat(40)}\n`;
      records.forEach((r, i) => {
        try {
          const d = decrypt<Record<string, string>>(r.encrypted_data);
          text += `\n[${i + 1}] ${r.created_at?.split('T')[0] ?? ''}\n`;
          Object.entries(d).forEach(([k, v]) => {
            if (v && typeof v === 'string' && v.trim() && !k.includes('path')) {
              text += `  ${k.replace(/_/g, ' ')}: ${v}\n`;
            }
          });
        } catch {}
      });
      text += '\n';
    }
    setPreview(text);
    setExporting(false);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Export & Reports" />
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color="#64748b" /><Text style={styles.backText}>More</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Select sections to include</Text>
        <View style={styles.grid}>
          {EXPORT_TYPES.map(e => (
            <TouchableOpacity
              key={e.key}
              onPress={() => toggle(e.key)}
              style={[styles.exportCard, { backgroundColor: e.bg }, selected.includes(e.key) && styles.exportCardSelected]}
            >
              <View style={styles.checkWrap}>
                {selected.includes(e.key) && <Ionicons name="checkmark-circle" size={20} color={e.color} />}
              </View>
              <Ionicons name={e.icon} size={24} color={e.color} />
              <Text style={[styles.exportLabel, { color: e.color }]}>{e.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, (selected.length === 0 || exporting) && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={selected.length === 0 || exporting}
        >
          {exporting ? <ActivityIndicator color="#fff" /> : <Ionicons name="document-text-outline" size={18} color="#fff" />}
          <Text style={styles.exportBtnText}>{exporting ? 'Generating…' : 'Generate Report'}</Text>
        </TouchableOpacity>

        {preview ? (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Report Preview</Text>
              <Text style={styles.previewNote}>Copy and share with your attorney</Text>
            </View>
            <Text style={styles.previewText} selectable>{preview}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10 },
  backText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  content: { padding: 20, gap: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e1b4b' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  exportCard: { width: '47%', borderRadius: 16, padding: 14, gap: 8, borderWidth: 2, borderColor: 'transparent' },
  exportCardSelected: { borderColor: '#4f46e5' },
  checkWrap: { height: 20, alignItems: 'flex-end' },
  exportLabel: { fontSize: 13, fontWeight: '700' },
  exportBtn: { backgroundColor: '#4f46e5', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  exportBtnDisabled: { opacity: 0.5 },
  exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  previewCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  previewHeader: { padding: 16, backgroundColor: '#eef2ff', borderBottomWidth: 1, borderBottomColor: '#e0e7ff' },
  previewTitle: { fontSize: 14, fontWeight: '700', color: '#4f46e5' },
  previewNote: { fontSize: 12, color: '#6366f1', marginTop: 2 },
  previewText: { padding: 16, fontSize: 12, fontFamily: 'Courier New', color: '#334155', lineHeight: 18 },
});
