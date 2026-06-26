import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRecords } from '../hooks/useRecords';
import { supabase } from '../lib/supabase';
import { CourtDate, Expense, Incident } from '../types';

type FeatureTile = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  tab: string;
  screen: string;
};

const TILES: FeatureTile[] = [
  { label: 'Incidents', icon: 'alert-circle', color: '#ef4444', bg: '#fef2f2', tab: 'Log', screen: 'IncidentLog' },
  { label: 'Expenses', icon: 'card', color: '#f59e0b', bg: '#fffbeb', tab: 'Finance', screen: 'ExpenseTracker' },
  { label: 'Documents', icon: 'folder', color: '#3b82f6', bg: '#eff6ff', tab: 'Legal', screen: 'DocumentVault' },
  { label: 'Calendar', icon: 'calendar', color: '#10b981', bg: '#f0fdf4', tab: 'More', screen: 'CustodyCalendar' },
  { label: 'Court', icon: 'business', color: '#6366f1', bg: '#eef2ff', tab: 'Legal', screen: 'CourtTimeline' },
  { label: 'Comms', icon: 'chatbubbles', color: '#8b5cf6', bg: '#f5f3ff', tab: 'Log', screen: 'CommunicationLog' },
  { label: 'Mood', icon: 'happy', color: '#ec4899', bg: '#fdf2f8', tab: 'Log', screen: 'MoodJournal' },
  { label: 'Assets', icon: 'bar-chart', color: '#14b8a6', bg: '#f0fdfa', tab: 'Finance', screen: 'AssetInventory' },
  { label: 'Attorney', icon: 'briefcase', color: '#f97316', bg: '#fff7ed', tab: 'Legal', screen: 'AttorneyNotes' },
  { label: 'Contacts', icon: 'people', color: '#0ea5e9', bg: '#f0f9ff', tab: 'More', screen: 'Contacts' },
  { label: 'Reminders', icon: 'notifications', color: '#a855f7', bg: '#faf5ff', tab: 'More', screen: 'Notifications' },
  { label: 'Export', icon: 'download', color: '#64748b', bg: '#f8fafc', tab: 'More', screen: 'Export' },
];

function StatPill({ label, value, icon, color }: { label: string; value: string | number; icon: keyof typeof Ionicons.glyphMap; color: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <View>
        <Text style={styles.pillValue}>{value}</Text>
        <Text style={styles.pillLabel}>{label}</Text>
      </View>
    </View>
  );
}

function TileButton({ tile, onPress }: { tile: FeatureTile; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  function pressIn() { Animated.spring(scale, { toValue: 0.93, damping: 15, useNativeDriver: true }).start(); }
  function pressOut() { Animated.spring(scale, { toValue: 1, damping: 15, useNativeDriver: true }).start(); }
  return (
    <Animated.View style={[styles.tile, { transform: [{ scale }] }]}>
      <TouchableOpacity style={styles.tileInner} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
        <View style={[styles.tileIcon, { backgroundColor: tile.bg }]}>
          <Ionicons name={tile.icon} size={22} color={tile.color} />
        </View>
        <Text style={styles.tileLabel}>{tile.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const { records: incidents } = useRecords<Incident>('incident');
  const { records: expenses } = useRecords<Expense>('expense');
  const { records: courtDates } = useRecords<CourtDate>('court_date');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? '';
      setName(email.split('@')[0]);
    });
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const upcoming = courtDates.filter(c => new Date(c.date) >= new Date()).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function goTo(tab: string, screen: string) {
    navigation.navigate(tab, { screen });
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#f8faff', '#ffffff']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGreeting}>{greeting},</Text>
              <Text style={styles.heroName}>{name || 'there'} 👋</Text>
              <Text style={styles.heroSub}>Your case is organized and private.</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🔐</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.pillsRow, { opacity: fadeAnim }]}>
        <StatPill label="Incidents" value={incidents.length} icon="alert-circle" color="#ef4444" />
        <StatPill label="Expenses" value={`$${totalExpenses.toFixed(0)}`} icon="card" color="#f59e0b" />
        <StatPill label="Upcoming" value={upcoming} icon="calendar" color="#6366f1" />
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.grid}>
          {TILES.map(tile => (
            <TileButton key={tile.label} tile={tile} onPress={() => goTo(tile.tab, tile.screen)} />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim, marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <TouchableOpacity style={styles.quickBtn} onPress={() => goTo('Log', 'IncidentLog')} activeOpacity={0.8}>
          <LinearGradient colors={['#ef4444', '#f97316']} style={styles.quickGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.quickText}>Log New Incident</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { marginTop: 10 }]} onPress={() => goTo('Finance', 'ExpenseTracker')} activeOpacity={0.8}>
          <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.quickGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.quickText}>Track Expense</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8faff' },
  scroll: { paddingBottom: 24 },

  hero: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  heroGrad: { borderRadius: 20 },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 2 },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  heroBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  heroBadgeText: { fontSize: 24 },

  pillsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 10 },
  pill: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  pillIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pillValue: { fontSize: 14, fontWeight: '800', color: '#1e1b4b', lineHeight: 16 },
  pillLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  section: { marginTop: 22, marginHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '30.5%' },
  tileInner: { backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  tileIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tileLabel: { fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center' },

  quickBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  quickGrad: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 16 },
  quickText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
