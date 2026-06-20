import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { getAge, formatDate } from '../utils/helpers';
import { RootStackParamList, HealthEventType } from '../types';

type RouteType = RouteProp<RootStackParamList, 'BirdDetail'>;
type Nav = StackNavigationProp<RootStackParamList>;

const HEALTH_LABELS: Record<HealthEventType, string> = {
  checkup: '✓ Checkup',
  illness: '🤒 Illness',
  treatment: '💊 Treatment',
  observation: '👁 Observation',
  death: '🕊 Death',
};

export default function BirdDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { birds, healthRecords, deleteHealthRecord } = useStore();

  const bird = birds.find((b) => b.id === route.params.birdId);
  if (!bird) return null;

  const birdHealth = healthRecords
    .filter((r) => r.birdId === bird.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDeleteRecord = (id: string) => {
    Alert.alert('Delete Record', 'Remove this health record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHealthRecord(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddBird', { birdId: bird.id })}>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Bird profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>
              {bird.sex === 'hen' ? '🐔' : bird.sex === 'rooster' ? '🐓' : '🐣'}
            </Text>
          </View>
          <Text style={styles.birdName}>{bird.name}</Text>
          <Text style={styles.birdBreed}>{bird.breed}</Text>
          {!bird.isActive && (
            <View style={styles.inactivePill}>
              <Text style={styles.inactivePillText}>Inactive</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            {bird.hatchDate ? (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getAge(bird.hatchDate)}</Text>
                <Text style={styles.statLabel}>Age</Text>
              </View>
            ) : null}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {bird.sex === 'hen' ? '🐔' : bird.sex === 'rooster' ? '🐓' : '❓'}
              </Text>
              <Text style={styles.statLabel}>{bird.sex}</Text>
            </View>
            {bird.color ? (
              <View style={styles.statItem}>
                <Text style={styles.statValue} numberOfLines={1}>{bird.color}</Text>
                <Text style={styles.statLabel}>Color</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Details */}
        {bird.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{bird.notes}</Text>
          </View>
        ) : null}

        {/* Acquired date */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Acquired</Text>
            <Text style={styles.infoValue}>{formatDate(bird.acquiredDate)}</Text>
          </View>
          {bird.hatchDate ? (
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Hatch Date</Text>
              <Text style={styles.infoValue}>{formatDate(bird.hatchDate)}</Text>
            </View>
          ) : null}
        </View>

        {/* Health records */}
        <View style={styles.healthSection}>
          <View style={styles.healthHeader}>
            <Text style={styles.sectionTitle}>Health History</Text>
            <TouchableOpacity
              style={styles.addHealthBtn}
              onPress={() => navigation.navigate('AddHealth', { birdId: bird.id })}
            >
              <Text style={styles.addHealthBtnText}>+ Add Record</Text>
            </TouchableOpacity>
          </View>

          {birdHealth.length === 0 ? (
            <View style={styles.emptyHealth}>
              <Text style={styles.emptyHealthText}>No health records yet. Add one to start tracking.</Text>
            </View>
          ) : (
            birdHealth.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={styles.healthCard}
                onLongPress={() => handleDeleteRecord(record.id)}
              >
                <View style={styles.healthCardLeft}>
                  <View
                    style={[
                      styles.healthTypeDot,
                      { backgroundColor: colors.healthColors[record.type] ?? colors.textMuted },
                    ]}
                  />
                  <View>
                    <Text style={styles.healthType}>{HEALTH_LABELS[record.type]}</Text>
                    <Text style={styles.healthDate}>{formatDate(record.date)}</Text>
                  </View>
                </View>
                <Text style={styles.healthNotes} numberOfLines={2}>{record.notes}</Text>
                {record.treatment ? (
                  <Text style={styles.healthTreatment}>Treatment: {record.treatment}</Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.md,
  },
  back: { fontSize: font.lg, color: colors.primary, fontWeight: '600' },
  edit: { fontSize: font.md, color: colors.primary, fontWeight: '600' },
  content: { padding: spacing.xl, paddingTop: spacing.xs },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarEmoji: { fontSize: 52 },
  birdName: { fontSize: font.xxl, fontWeight: '800', color: colors.text, marginBottom: 4 },
  birdBreed: { fontSize: font.md, color: colors.textSecondary, marginBottom: spacing.sm },
  inactivePill: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  inactivePillText: { fontSize: font.xs, color: colors.textMuted, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.md },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  notesTitle: { fontSize: font.sm, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  notesText: { fontSize: font.md, color: colors.text, lineHeight: 22 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs, paddingTop: spacing.md },
  infoLabel: { fontSize: font.md, color: colors.textSecondary },
  infoValue: { fontSize: font.md, color: colors.text, fontWeight: '600' },
  healthSection: { marginBottom: spacing.md },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  addHealthBtn: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  addHealthBtnText: { fontSize: font.sm, color: colors.secondaryDark, fontWeight: '700' },
  emptyHealth: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyHealthText: { fontSize: font.md, color: colors.textMuted, textAlign: 'center' },
  healthCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  healthCardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  healthTypeDot: { width: 10, height: 10, borderRadius: 5 },
  healthType: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  healthDate: { fontSize: font.xs, color: colors.textMuted },
  healthNotes: { fontSize: font.sm, color: colors.textSecondary, lineHeight: 20, paddingLeft: spacing.lg + 2 },
  healthTreatment: { fontSize: font.xs, color: colors.secondary, fontWeight: '600', marginTop: 4, paddingLeft: spacing.lg + 2 },
});
