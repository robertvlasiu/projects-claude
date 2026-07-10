import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import GettingStarted, { GuideStep } from '../components/GettingStarted';
import { useSubscription } from '../hooks/useSubscription';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecords } from '../hooks/useRecords';
import { getNotificationPermissionStatus, requestNotificationPermissions } from '../lib/notifications';
import { supabase, withTimeout } from '../lib/supabase';
import { Contact, CourtDate, CustodyEvent, Expense, Incident, Reminder } from '../types';

import { guideDismissedKey } from '../lib/onboarding';

type UpcomingItem = {
  id: string;
  date: string;
  title: string;
  meta: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tab: string;
  screen: string;
};

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

function relativeDay(dateStr: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return d.toLocaleDateString('en', { weekday: 'long' });
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { status, isPro } = useSubscription();
  const [name, setName] = useState('');
  const { records: incidents, loading: loadingIncidents, reload: reloadIncidents } = useRecords<Incident>('incident');
  const { records: expenses, reload: reloadExpenses } = useRecords<Expense>('expense');
  const { records: courtDates, loading: loadingCourt, reload: reloadCourt } = useRecords<CourtDate>('court_date');
  const { records: custody, loading: loadingCustody, reload: reloadCustody } = useRecords<CustodyEvent>('custody_event');
  const { records: reminders, reload: reloadReminders } = useRecords<Reminder>('reminder');
  const { records: contacts, loading: loadingContacts, reload: reloadContacts } = useRecords<Contact>('contact');

  // Refresh dashboard data whenever the tab regains focus, so stats and the
  // checklist reflect records added elsewhere in the app.
  const firstFocus = useRef(true);
  useFocusEffect(
    React.useCallback(() => {
      if (firstFocus.current) { firstFocus.current = false; return; }
      reloadIncidents(); reloadExpenses(); reloadCourt();
      reloadCustody(); reloadReminders(); reloadContacts();
    }, [])
  );

  const [userId, setUserId] = useState<string | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);
  const [guideDismissed, setGuideDismissed] = useState<boolean | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    withTimeout(supabase.auth.getSession()).then(result => {
      const email = result?.data?.session?.user?.email ?? '';
      const uid = result?.data?.session?.user?.id ?? null;
      setName(email.split('@')[0]);
      setUserId(uid);
      if (uid) AsyncStorage.getItem(guideDismissedKey(uid)).then(v => setGuideDismissed(v === '1'));
      else setGuideDismissed(true);
    });
    getNotificationPermissionStatus().then(setNotifGranted);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  function dismissGuide() {
    if (!userId) return;
    setGuideDismissed(true);
    AsyncStorage.setItem(guideDismissedKey(userId), '1');
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayStr = new Date().toISOString().split('T')[0];

  const upcoming: UpcomingItem[] = [
    ...courtDates.filter(c => c.date >= todayStr).map(c => ({
      id: c.id, date: c.date, title: c.title || c.type, meta: c.time ? `Court · ${c.time}` : 'Court',
      icon: 'business' as const, color: '#6366f1', tab: 'Legal', screen: 'CourtTimeline',
    })),
    ...custody.filter(c => c.date >= todayStr).map(c => ({
      id: c.id, date: c.date, title: `${c.type}${c.child_names ? ` · ${c.child_names}` : ''}`,
      meta: c.with_parent === 'me' ? 'Custody · with you' : 'Custody · with other party',
      icon: 'people' as const, color: '#10b981', tab: 'More', screen: 'CustodyCalendar',
    })),
    ...reminders.filter(r => !r.completed && r.date >= todayStr).map(r => ({
      id: r.id, date: r.date, title: r.title, meta: `Reminder · ${r.type}`,
      icon: 'notifications' as const, color: '#a855f7', tab: 'More', screen: 'Notifications',
    })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const upcomingCount = upcoming.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'there';

  function goTo(tab: string, screen: string) {
    navigation.navigate(tab, { screen });
  }

  const pendingReminders = reminders.filter(r => !r.completed && r.date >= todayStr).length;

  const guideSteps: GuideStep[] = [
    ...(notifGranted === false ? [{
      key: 'notifications', title: 'Turn on notifications',
      subtitle: 'Get alerts before court dates and exchanges',
      icon: 'notifications' as const, color: '#a855f7', done: false,
      onPress: async () => setNotifGranted(await requestNotificationPermissions()),
    }] : []),
    {
      key: 'incident', title: 'Log your first incident',
      subtitle: 'Date, severity, witnesses — all encrypted',
      icon: 'warning' as const, color: '#ef4444', done: incidents.length > 0,
      onPress: () => goTo('Log', 'IncidentLog'),
    },
    {
      key: 'court', title: 'Add a court date',
      subtitle: 'Hearings, deadlines, mediation sessions',
      icon: 'business' as const, color: '#6366f1', done: courtDates.length > 0,
      onPress: () => goTo('Legal', 'CourtTimeline'),
    },
    {
      key: 'custody', title: 'Set up your custody schedule',
      subtitle: 'Track exchanges and any violations',
      icon: 'people' as const, color: '#10b981', done: custody.length > 0,
      onPress: () => goTo('More', 'CustodyCalendar'),
    },
    {
      key: 'contact', title: 'Add your attorney',
      subtitle: 'Keep your legal team one tap away',
      icon: 'person-add' as const, color: '#14b8a6', done: contacts.length > 0,
      onPress: () => goTo('More', 'Contacts'),
    },
  ];
  const guideLoaded = guideDismissed !== null && !loadingIncidents && !loadingCourt && !loadingCustody && !loadingContacts;
  const showGuide = guideLoaded && !guideDismissed && guideSteps.some(s => !s.done);

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#f8faff', '#ffffff']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroGreeting}>{greeting},</Text>
              <Text style={styles.heroName}>{displayName}</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => goTo('More', 'Notifications')} activeOpacity={0.8}>
              <Ionicons name="notifications" size={20} color="#fff" />
              {pendingReminders > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{pendingReminders > 9 ? '9+' : pendingReminders}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.heroEncRow}>
            <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroSub}>End-to-end encrypted · only you can read your case</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {status?.inTrial && isPro ? (
        <TouchableOpacity
          style={styles.trialBanner}
          onPress={() => goTo('More', 'Subscription')}
          activeOpacity={0.85}
        >
          <Ionicons name="gift-outline" size={18} color="#059669" />
          <Text style={styles.trialBannerText}>
            App Store free trial active
            {status.expiresAt
              ? ` · ends ${new Date(status.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
              : ''}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#059669" />
        </TouchableOpacity>
      ) : null}

      {showGuide && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <GettingStarted steps={guideSteps} onDismiss={dismissGuide} />
        </Animated.View>
      )}

      <Animated.View style={[styles.pillsRow, { opacity: fadeAnim }]}>
        <StatPill label="Incidents" value={incidents.length} icon="alert-circle" color="#ef4444" />
        <StatPill label="Spent" value={`$${totalExpenses.toFixed(0)}`} icon="card" color="#f59e0b" />
        <StatPill label="Upcoming" value={upcomingCount} icon="calendar" color="#6366f1" />
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcoming.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={22} color="#a5b4fc" />
            <Text style={styles.emptyText}>Nothing scheduled. Court dates, custody days and reminders show up here.</Text>
          </View>
        ) : (
          upcoming.map(item => (
            <TouchableOpacity key={item.id} style={styles.upcomingCard} onPress={() => goTo(item.tab, item.screen)} activeOpacity={0.7}>
              <View style={[styles.upIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.upBody}>
                <Text style={styles.upTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.upMeta}>{item.meta}</Text>
              </View>
              <View style={styles.upDateWrap}>
                <Text style={[styles.upDate, { color: item.color }]}>{relativeDay(item.date)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Animated.View>

      <Animated.View style={[styles.section, { opacity: fadeAnim, marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.quickBtn} onPress={() => goTo('Log', 'IncidentLog')} activeOpacity={0.85}>
          <LinearGradient colors={['#ef4444', '#f97316']} style={styles.quickGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.quickText}>Log an Incident</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { marginTop: 10 }]} onPress={() => goTo('Finance', 'ExpenseTracker')} activeOpacity={0.85}>
          <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.quickGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.quickText}>Track an Expense</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { marginTop: 10 }]} onPress={() => goTo('Legal', 'CourtTimeline')} activeOpacity={0.85}>
          <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.quickGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.quickText}>Add a Court Date</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8faff' },
  scroll: { paddingBottom: 24 },

  hero: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 10 },
  heroGrad: { borderRadius: 20, padding: 22 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroTextWrap: { flex: 1 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 2 },
  heroName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 10 },
  bellBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center' },
  bellBadge: { position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#5457e8' },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  heroEncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  trialBannerText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#047857' },

  pillsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 10 },
  pill: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  pillIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  pillValue: { fontSize: 14, fontWeight: '800', color: '#1e1b4b', lineHeight: 16 },
  pillLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  section: { marginTop: 22, marginHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  emptyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  emptyText: { flex: 1, fontSize: 13, color: '#94a3b8', lineHeight: 18 },

  upcomingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  upIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  upBody: { flex: 1 },
  upTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  upMeta: { fontSize: 12, color: '#94a3b8' },
  upDateWrap: { alignItems: 'flex-end' },
  upDate: { fontSize: 13, fontWeight: '700' },

  quickBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  quickGrad: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 16 },
  quickText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
