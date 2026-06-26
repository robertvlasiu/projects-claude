import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MenuScreen, { MenuItem } from '../components/MenuScreen';
import { supabase } from '../lib/supabase';

const ITEMS: MenuItem[] = [
  { label: 'Custody Calendar', description: 'Visual custody schedule with handoff tracking', icon: 'people', color: '#8b5cf6', bg: '#f5f3ff', screen: 'CustodyCalendar' },
  { label: 'Contacts', description: 'Attorney, mediator, judge, therapist, school', icon: 'person-add', color: '#14b8a6', bg: '#f0fdfa', screen: 'Contacts' },
  { label: 'Export & Reports', description: 'Generate PDF summaries for your attorney', icon: 'share-social', color: '#6366f1', bg: '#eef2ff', screen: 'Export' },
  { label: 'Reminders', description: 'Push alerts for court dates and custody exchanges', icon: 'notifications', color: '#f97316', bg: '#fff7ed', screen: 'Notifications' },
  { label: 'Settings & Security', description: 'Face ID, PIN, and how your data is encrypted', icon: 'shield-checkmark', color: '#10b981', bg: '#ecfdf5', screen: 'Settings' },
];

export default function MoreMenuScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <MenuScreen title="More" subtitle="Tools and settings" items={ITEMS} navigation={navigation} />
      <TouchableOpacity style={styles.signOut} onPress={() => supabase.auth.signOut()}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  signOut: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 20, padding: 16, borderRadius: 16,
    backgroundColor: '#fef2f2', justifyContent: 'center',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
});
