import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { sendSupportMessage } from '../lib/support';
import { supabase, withTimeout } from '../lib/supabase';

export default function ContactSupportScreen({ navigation }: any) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    withTimeout(supabase.auth.getSession()).then(result => {
      setUserEmail(result?.data?.session?.user?.email ?? null);
    });
  }, []);

  async function handleSend() {
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      Alert.alert('Add more detail', 'Please describe your issue in at least a few sentences.');
      return;
    }
    setSending(true);
    const result = await sendSupportMessage({ subject, message: trimmed });
    setSending(false);
    if (!result.ok) {
      Alert.alert('Could not send', result.error);
      return;
    }
    Alert.alert('Message sent', 'Thanks — we will get back to you at your account email.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Contact Support" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Ionicons name="mail-outline" size={22} color="#4f46e5" />
            <Text style={styles.introText}>
              Describe your issue below. We will reply to{' '}
              {userEmail ? userEmail : 'your account email'}.
            </Text>
          </View>

          <Text style={styles.label}>Subject (optional)</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Cannot view attachments"
            maxLength={120}
          />

          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us what happened and what you expected…"
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text style={styles.hint}>{message.trim().length}/5000 · min 10 characters</Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.85}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendText}>Send message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  flex: { flex: 1 },
  content: { padding: 16, gap: 8, paddingBottom: 24 },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  introText: { flex: 1, fontSize: 14, color: '#4338ca', lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: { minHeight: 160, paddingTop: 12 },
  hint: { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  sendBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sendBtnDisabled: { opacity: 0.6 },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
