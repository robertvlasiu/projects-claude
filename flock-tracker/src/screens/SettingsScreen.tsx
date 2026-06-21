import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { buildEggLogsCsv } from '../utils/helpers';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function SettingRow({
  label,
  desc,
  value,
  onPress,
  right,
}: {
  label: string;
  desc?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const inner = (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {desc ? <Text style={styles.rowDesc}>{desc}</Text> : null}
      </View>
      {right ?? (value ? <Text style={styles.rowValue}>{value}</Text> : <Text style={styles.chevron}>›</Text>)}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { isPremium, notificationsEnabled, setNotificationsEnabled, eggLogs } = useStore();

  const handleNotificationToggle = (val: boolean) => {
    // TODO: wire expo-notifications:
    // if (val) scheduleEggReminder(); else cancelEggReminder();
    setNotificationsEnabled(val);
  };

  const handleExportCsv = async () => {
    if (!isPremium) {
      navigation.navigate('Upgrade');
      return;
    }
    if (eggLogs.length === 0) {
      Alert.alert('Nothing to export', 'Log some eggs first, then come back here.');
      return;
    }
    const csv = buildEggLogsCsv(eggLogs);
    try {
      await Share.share({ message: csv, title: 'Flock Tracker — Egg Log' });
    } catch {
      Alert.alert('Export failed', 'Could not open the share sheet.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => navigation.navigate('Upgrade')}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeEmoji}>⭐</Text>
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSub}>Unlimited birds · CSV export · $4.99/mo</Text>
            </View>
            <Text style={styles.upgradeChevron}>›</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeader}>REMINDERS</Text>
        <View style={styles.card}>
          <SettingRow
            label="Daily Egg Reminder"
            desc="5:00 PM nudge to log today's collection"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        <Text style={styles.sectionHeader}>DATA</Text>
        <View style={styles.card}>
          <SettingRow
            label={isPremium ? 'Export Egg Log (CSV)' : 'Export Egg Log (CSV) 🔒'}
            desc="Share all egg records as a spreadsheet"
            onPress={handleExportCsv}
          />
        </View>

        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.card}>
          <SettingRow label="Version" value="1.0.0" />
          {isPremium && (
            <SettingRow
              label="Plan"
              value="Premium ⭐"
            />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  backBtn: { marginBottom: spacing.xs },
  backText: { fontSize: font.md, color: colors.primary, fontWeight: '600' },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },

  content: { padding: spacing.xl, paddingTop: spacing.md },

  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.primaryMid,
    gap: spacing.md,
    ...shadow.sm,
  },
  upgradeEmoji: { fontSize: 28 },
  upgradeText: { flex: 1 },
  upgradeTitle: { fontSize: font.md, fontWeight: '800', color: colors.primaryDark },
  upgradeSub: { fontSize: font.sm, color: colors.primaryDark, opacity: 0.75, marginTop: 2 },
  upgradeChevron: { fontSize: font.xxl, color: colors.primaryDark, fontWeight: '300' },

  sectionHeader: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: font.md, fontWeight: '600', color: colors.text },
  rowDesc: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  rowValue: { fontSize: font.md, color: colors.textSecondary, fontWeight: '600' },
  chevron: { fontSize: font.xl, color: colors.textMuted, fontWeight: '300' },
});
