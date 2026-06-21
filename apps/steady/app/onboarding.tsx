/**
 * Onboarding quiz — the personalization + shareable artifact.
 *
 * This scaffold implements a minimal 2-step version (name + triggers) and
 * persists a Dog. MVP task: expand to the full flow (breed, baseline threshold
 * slider, a "your dog's profile" summary card that's screenshot-worthy for
 * social sharing). See BUILD_TO_MVP.md.
 */
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, H1, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import type { TriggerKind } from "@/data/types";

const TRIGGERS: { kind: TriggerKind; label: string }[] = [
  { kind: "other_dogs", label: "Other dogs" },
  { kind: "men", label: "Men" },
  { kind: "women", label: "Women" },
  { kind: "children", label: "Children" },
  { kind: "bikes", label: "Bikes" },
  { kind: "cars", label: "Cars" },
  { kind: "skateboards", label: "Skateboards" },
  { kind: "loud_noises", label: "Loud noises" },
];

export default function Onboarding() {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<TriggerKind[]>([]);

  function toggle(k: TriggerKind) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  async function finish() {
    await store.saveDog({
      id: uid(),
      name: name.trim() || "your dog",
      triggers: selected,
      createdAt: new Date().toISOString(),
    });
    router.replace("/");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Let's get steady</H1>
      <Muted>A calmer walk starts with knowing the triggers.</Muted>

      <View style={{ height: spacing.lg }} />
      <Body>What's your dog's name?</Body>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Luna"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={{ height: spacing.lg }} />
      <Body>What sets them off? (tap all that apply)</Body>
      <View style={styles.chips}>
        {TRIGGERS.map((t) => {
          const on = selected.includes(t.kind);
          return (
            <Pressable
              key={t.kind}
              onPress={() => toggle(t.kind)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.xl }} />
      <Button
        label="Build my plan"
        onPress={finish}
        disabled={selected.length === 0}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl * 2 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    color: colors.text,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextOn: { color: "#fff", fontWeight: "600" },
});
