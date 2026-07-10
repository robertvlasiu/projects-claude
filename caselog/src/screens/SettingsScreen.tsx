import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { clearPin } from '../lib/pin';
import { supabase } from '../lib/supabase';

export default function SettingsScreen({ navigation }: any) {
  const [deleting, setDeleting] = useState(false);

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete your account?',
      'This permanently erases your account and every record, file and note in it. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => Alert.alert(
            'Are you absolutely sure?',
            'All of your case documentation will be gone forever.',
            [
              { text: 'Keep my account', style: 'cancel' },
              { text: 'Yes, delete it all', style: 'destructive', onPress: deleteAccount },
            ]
          ),
        },
      ]
    );
  }

  async function deleteAccount() {
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const accountId = session?.user?.id;
    try {
      if (accountId) {
        const bucket = supabase.storage.from('attachments');
        const { data: folders } = await bucket.list(accountId);
        await Promise.all(
          (folders ?? []).map(async folder => {
            const { data: files } = await bucket.list(`${accountId}/${folder.name}`);
            if (files?.length) await bucket.remove(files.map(f => `${accountId}/${folder.name}/${f.name}`));
          }),
        );
      }
    } catch {
      // file cleanup is best-effort; account deletion below is what matters
    }
    const { error } = await supabase.rpc('delete_user');
    if (error) {
      setDeleting(false);
      Alert.alert('Could not delete account', 'Something went wrong. Check your connection and try again.');
      return;
    }
    if (accountId) await clearPin(accountId);
    await supabase.auth.signOut();
    setDeleting(false);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePin')}>
            <View style={styles.rowIcon}><Ionicons name="keypad" size={20} color="#4f46e5" /></View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Change PIN</Text>
              <Text style={styles.rowSub}>Set a new 4-digit unlock PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Privacy &amp; Encryption</Text>
        <View style={styles.card}>
          <View style={styles.encHeader}>
            <Ionicons name="lock-closed" size={18} color="#10b981" />
            <Text style={styles.encTitle}>Your case is encrypted</Text>
          </View>
          <Text style={styles.encBody}>
            Every incident, message, expense, note and uploaded file is encrypted on your device
            with AES before it&apos;s stored. Your PIN never leaves your phone.
          </Text>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>Records encrypted before upload</Text></View>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>Attachments encrypted, stored privately</Text></View>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>PIN stored per account on this device</Text></View>
          <View style={styles.bullet}><Ionicons name="checkmark-circle" size={15} color="#10b981" /><Text style={styles.bulletText}>Only your account can read your data</Text></View>
        </View>

        <Text style={styles.sectionLabel}>Help</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ContactSupport')}>
            <View style={[styles.rowIcon, { backgroundColor: '#f0f9ff' }]}>
              <Ionicons name="mail" size={20} color="#0ea5e9" />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>Contact Support</Text>
              <Text style={styles.rowSub}>Send us a message — we reply to your account email</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={confirmDeleteAccount} disabled={deleting}>
            <View style={[styles.rowIcon, { backgroundColor: '#fef2f2' }]}>
              {deleting ? <ActivityIndicator size="small" color="#ef4444" /> : <Ionicons name="trash" size={20} color="#ef4444" />}
            </View>
            <View style={styles.rowBody}>
              <Text style={[styles.rowTitle, { color: '#ef4444' }]}>Delete account</Text>
              <Text style={styles.rowSub}>Permanently erase your account and all case data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 12, marginBottom: 4, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 4, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  rowSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  encHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, paddingBottom: 8 },
  encTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  encBody: { fontSize: 13, color: '#64748b', lineHeight: 19, paddingHorizontal: 14, marginBottom: 10 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 4 },
  bulletText: { fontSize: 13, color: '#334155' },
});
