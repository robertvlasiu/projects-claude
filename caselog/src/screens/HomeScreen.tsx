import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#f0f4ff']} style={StyleSheet.absoluteFill} />
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>A</Text>
        </View>
        <Text style={styles.logoText}>Auris</Text>
      </View>
      <Text style={styles.subtitle}>Dashboard coming soon</Text>
      <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoMarkText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  logoText: { fontSize: 30, fontWeight: '800', color: '#1e1b4b', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 48 },
  button: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
