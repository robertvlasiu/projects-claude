import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { generateId, toDateKey } from '../utils/helpers';
import { HealthEventType, RootStackParamList } from '../types';

type RouteType = RouteProp<RootStackParamList, 'AddHealth'>;

const EVENT_TYPES: { value: HealthEventType; label: string; emoji: string; color: string }[] = [
  { value: 'observation', label: 'Observation', emoji: '👁', color: '#8B5CF6' },
  { value: 'checkup', label: 'Checkup', emoji: '✓', color: '#22C55E' },
  { value: 'illness', label: 'Illness', emoji: '🤒', color: '#EF4444' },
  { value: 'treatment', label: 'Treatment', emoji: '💊', color: '#3B82F6' },
  { value: 'death', label: 'Passed', emoji: '🕊', color: '#6B7280' },
];

export default function AddHealthScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const insets = useSafeAreaInsets();
  const { birds, addHealthRecord } = useStore();

  const bird = birds.find((b) => b.id === route.params.birdId);

  const [type, setType] = useState<HealthEventType>('observation');
  const [notes, setNotes] = useState('');
  const [treatment, setTreatment] = useState('');

  const handleSave = () => {
    if (!notes.trim()) return;
    addHealthRecord({
      id: generateId(),
      birdId: route.params.birdId,
      date: toDateKey(),
      type,
      notes: notes.trim(),
      treatment: treatment.trim() || undefined,
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Health Record</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.save, !notes.trim() && styles.saveDisabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {bird && (
          <View style={styles.birdBanner}>
            <Text style={styles.birdBannerText}>
              {bird.sex === 'hen' ? '🐔' : '🐓'} Recording for {bird.name}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Event Type</Text>
          <View style={styles.typeGrid}>
            {EVENT_TYPES.map((et) => (
              <TouchableOpacity
                key={et.value}
                style={[
                  styles.typeBtn,
                  type === et.value && { backgroundColor: et.color + '20', borderColor: et.color },
                ]}
                onPress={() => setType(et.value)}
              >
                <Text style={styles.typeEmoji}>{et.emoji}</Text>
                <Text
                  style={[styles.typeLabel, type === et.value && { color: et.color, fontWeight: '700' }]}
                >
                  {et.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes *</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="What did you observe? Be specific — this is your flock's medical record."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            autoFocus
          />
        </View>

        {(type === 'illness' || type === 'treatment') && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Treatment / Action (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dusted with DE, separated from flock, vet visit"
              placeholderTextColor={colors.textMuted}
              value={treatment}
              onChangeText={setTreatment}
            />
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { fontSize: font.md, color: colors.textSecondary },
  navTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  save: { fontSize: font.md, color: colors.primary, fontWeight: '700' },
  saveDisabled: { opacity: 0.4 },
  content: { padding: spacing.xl },
  birdBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  birdBannerText: { fontSize: font.md, color: colors.primaryDark, fontWeight: '600' },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  sectionLabel: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeEmoji: { fontSize: font.md },
  typeLabel: { fontSize: font.sm, color: colors.textSecondary, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: font.md,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
  },
  notesInput: { height: 120, paddingTop: spacing.sm + 2, textAlignVertical: 'top' },
});
