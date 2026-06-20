import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '../store';
import { colors, spacing, radius, font, shadow } from '../constants/theme';
import { generateId, toDateKey, BREED_OPTIONS } from '../utils/helpers';
import { Bird, BirdSex, RootStackParamList } from '../types';

type RouteType = RouteProp<RootStackParamList, 'AddBird'>;

const SEX_OPTIONS: { value: BirdSex; label: string; emoji: string }[] = [
  { value: 'hen', label: 'Hen', emoji: '🐔' },
  { value: 'rooster', label: 'Rooster', emoji: '🐓' },
  { value: 'unknown', label: 'Unknown', emoji: '🐣' },
];

export default function AddBirdScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { birds, addBird, updateBird, deleteBird } = useStore();

  const editBird = route.params?.birdId ? birds.find((b) => b.id === route.params.birdId) : null;

  const [name, setName] = useState(editBird?.name ?? '');
  const [breed, setBreed] = useState(editBird?.breed ?? '');
  const [sex, setSex] = useState<BirdSex>(editBird?.sex ?? 'hen');
  const [hatchDate, setHatchDate] = useState(editBird?.hatchDate ?? '');
  const [color, setColor] = useState(editBird?.color ?? '');
  const [notes, setNotes] = useState(editBird?.notes ?? '');
  const [isActive, setIsActive] = useState(editBird?.isActive ?? true);
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please give your bird a name.');
      return;
    }
    if (!breed.trim()) {
      Alert.alert('Missing info', 'Please select or enter a breed.');
      return;
    }

    const bird: Bird = {
      id: editBird?.id ?? generateId(),
      name: name.trim(),
      breed: breed.trim(),
      sex,
      hatchDate: hatchDate.trim() || undefined,
      acquiredDate: editBird?.acquiredDate ?? toDateKey(),
      color: color.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive,
      photo: editBird?.photo,
    };

    if (editBird) {
      updateBird(bird);
    } else {
      addBird(bird);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('Remove Bird', `Remove ${editBird?.name} from your flock?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          deleteBird(editBird!.id);
          navigation.goBack();
        },
      },
    ]);
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
        <Text style={styles.navTitle}>{editBird ? 'Edit Bird' : 'Add Bird'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Sex selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sex</Text>
          <View style={styles.sexRow}>
            {SEX_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.sexBtn, sex === opt.value && styles.sexBtnActive]}
                onPress={() => setSex(opt.value)}
              >
                <Text style={styles.sexEmoji}>{opt.emoji}</Text>
                <Text style={[styles.sexLabel, sex === opt.value && styles.sexLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Henrietta, Pepper, Queen Beak"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Breed */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Breed *</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowBreedPicker(true)}>
            <Text style={breed ? styles.pickerValue : styles.pickerPlaceholder}>
              {breed || 'Select a breed...'}
            </Text>
            <Text style={styles.pickerArrow}>›</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { marginTop: spacing.xs }]}
            placeholder="Or type a custom breed"
            placeholderTextColor={colors.textMuted}
            value={breed}
            onChangeText={setBreed}
          />
        </View>

        {/* Hatch date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hatch Date (optional)</Text>
          <Text style={styles.sectionHint}>Format: YYYY-MM-DD</Text>
          <TextInput
            style={styles.input}
            placeholder="2024-03-15"
            placeholderTextColor={colors.textMuted}
            value={hatchDate}
            onChangeText={setHatchDate}
          />
        </View>

        {/* Color / description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color / Markings (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Black with white speckles"
            placeholderTextColor={colors.textMuted}
            value={color}
            onChangeText={setColor}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Personality, quirks, anything worth noting..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Active toggle */}
        {editBird && (
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Active in flock</Text>
                <Text style={styles.toggleSub}>Toggle off for retired or passed birds</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleSwitch, isActive && styles.toggleSwitchOn]}
                onPress={() => setIsActive(!isActive)}
              >
                <View style={[styles.toggleThumb, isActive && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {editBird && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Remove from Flock</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Breed picker modal */}
      <Modal visible={showBreedPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Breed</Text>
            <TouchableOpacity onPress={() => setShowBreedPicker(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={BREED_OPTIONS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.breedRow}
                onPress={() => {
                  setBreed(item);
                  setShowBreedPicker(false);
                }}
              >
                <Text style={[styles.breedLabel, breed === item && styles.breedLabelActive]}>
                  {item}
                </Text>
                {breed === item && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
    paddingTop: spacing.xl + 8,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { fontSize: font.md, color: colors.textSecondary },
  navTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  save: { fontSize: font.md, color: colors.primary, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: spacing.xl },
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
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  sexRow: { flexDirection: 'row', gap: spacing.sm },
  sexBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sexBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  sexEmoji: { fontSize: 28, marginBottom: spacing.xs },
  sexLabel: { fontSize: font.sm, color: colors.textSecondary, fontWeight: '600' },
  sexLabelActive: { color: colors.primaryDark, fontWeight: '700' },
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
  notesInput: { height: 80, paddingTop: spacing.sm + 2 },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.xs,
  },
  pickerValue: { fontSize: font.md, color: colors.text },
  pickerPlaceholder: { fontSize: font.md, color: colors.textMuted },
  pickerArrow: { fontSize: font.xl, color: colors.textMuted },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: { fontSize: font.md, fontWeight: '600', color: colors.text },
  toggleSub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchOn: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    ...shadow.sm,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  deleteBtn: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  deleteBtnText: { color: colors.error, fontWeight: '700', fontSize: font.md },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  modalDone: { fontSize: font.md, color: colors.primary, fontWeight: '700' },
  breedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breedLabel: { fontSize: font.md, color: colors.text },
  breedLabelActive: { color: colors.primary, fontWeight: '700' },
  checkmark: { color: colors.primary, fontWeight: '700', fontSize: font.md },
});
