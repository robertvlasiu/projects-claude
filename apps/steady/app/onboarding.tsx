/**
 * Onboarding quiz — the personalization + shareable artifact.
 *
 * Multi-step flow: name → breed/age → triggers → baseline threshold →
 * a screenshot-worthy "[Dog]'s Profile" summary card. Persists a Dog at the end.
 */
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import Slider from "@react-native-community/slider";
import { Body, Button, H1, Muted } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme";
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

const TRIGGER_LABEL: Record<TriggerKind, string> = {
  other_dogs: "Other dogs",
  men: "Men",
  women: "Women",
  children: "Children",
  bikes: "Bikes",
  cars: "Cars",
  skateboards: "Skateboards",
  loud_noises: "Loud noises",
  other: "Other",
};

type Step = "name" | "about" | "triggers" | "threshold" | "summary";

export default function Onboarding() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [selected, setSelected] = useState<TriggerKind[]>([]);
  const [thresholdFt, setThresholdFt] = useState(25);
  const [saving, setSaving] = useState(false);

  const dogName = name.trim() || "your dog";

  function toggle(k: TriggerKind) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  async function finish() {
    if (saving) return;
    setSaving(true);
    const ageMonths = ageYears.trim()
      ? Math.round(parseFloat(ageYears) * 12)
      : undefined;
    await store.saveDog({
      id: uid(),
      name: dogName,
      breed: breed.trim() || undefined,
      ageMonths: Number.isFinite(ageMonths as number) ? ageMonths : undefined,
      triggers: selected,
      baselineThresholdFt: Math.round(thresholdFt),
      createdAt: new Date().toISOString(),
    });
    router.replace("/");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === "name" && (
        <View>
          <H1>Let's get steady</H1>
          <Muted>A calmer walk starts with knowing your dog.</Muted>
          <View style={{ height: spacing.xl }} />
          <Body>What's your dog's name?</Body>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Luna"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => name.trim() && setStep("about")}
          />
          <View style={{ height: spacing.xl }} />
          <Button
            label="Next"
            onPress={() => setStep("about")}
            disabled={!name.trim()}
          />
        </View>
      )}

      {step === "about" && (
        <View>
          <H1>Tell us about {dogName}</H1>
          <Muted>Optional — helps us tailor the plan.</Muted>
          <View style={{ height: spacing.lg }} />
          <Body>Breed (optional)</Body>
          <TextInput
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g. Border Collie mix"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <View style={{ height: spacing.lg }} />
          <Body>Approximate age (years)</Body>
          <TextInput
            value={ageYears}
            onChangeText={setAgeYears}
            placeholder="e.g. 2"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <View style={{ height: spacing.xl }} />
          <Button label="Next" onPress={() => setStep("triggers")} />
          <View style={{ height: spacing.sm }} />
          <Button label="Back" variant="ghost" onPress={() => setStep("name")} />
        </View>
      )}

      {step === "triggers" && (
        <View>
          <H1>What sets {dogName} off?</H1>
          <Muted>Tap all that apply.</Muted>
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
            label="Next"
            onPress={() => setStep("threshold")}
            disabled={selected.length === 0}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            label="Back"
            variant="ghost"
            onPress={() => setStep("about")}
          />
        </View>
      )}

      {step === "threshold" && (
        <View>
          <H1>How close is too close?</H1>
          <Muted>
            About how near can a trigger get before {dogName} reacts today?
          </Muted>
          <View style={{ height: spacing.xl }} />
          <View style={styles.thresholdCard}>
            <Text style={styles.thresholdValue}>{Math.round(thresholdFt)} ft</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={5}
              maximumValue={100}
              step={5}
              value={thresholdFt}
              onValueChange={setThresholdFt}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.accent}
            />
            <View style={styles.scaleRow}>
              <Muted>5 ft</Muted>
              <Muted>100 ft</Muted>
            </View>
          </View>
          <Muted>
            This is your starting line — we'll track it shrinking over time.
          </Muted>
          <View style={{ height: spacing.xl }} />
          <Button label="See my dog's profile" onPress={() => setStep("summary")} />
          <View style={{ height: spacing.sm }} />
          <Button
            label="Back"
            variant="ghost"
            onPress={() => setStep("triggers")}
          />
        </View>
      )}

      {step === "summary" && (
        <View>
          <Muted>Profile ready 🎉</Muted>
          <View style={{ height: spacing.md }} />
          <View style={styles.profileCard}>
            <Text style={styles.profileBrand}>STEADY</Text>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {dogName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.profileName}>{dogName}'s Profile</Text>
            <Text style={styles.profileSub}>
              {[breed.trim(), ageYears.trim() ? `${ageYears.trim()} yr` : ""]
                .filter(Boolean)
                .join(" · ") || "Reactive dog in training"}
            </Text>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{Math.round(thresholdFt)}ft</Text>
                <Text style={styles.statLabel}>Starting threshold</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{selected.length}</Text>
                <Text style={styles.statLabel}>Known triggers</Text>
              </View>
            </View>

            <Text style={styles.profileTriggersLabel}>Working on</Text>
            <View style={styles.profileChips}>
              {selected.map((k) => (
                <View key={k} style={styles.profileChip}>
                  <Text style={styles.profileChipText}>{TRIGGER_LABEL[k]}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.profileFooter}>Day 1 of a calmer walk 🐾</Text>
          </View>

          <View style={{ height: spacing.md }} />
          <Button
            label={saving ? "Building your plan…" : "Start training"}
            onPress={finish}
            disabled={saving}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            label="Back"
            variant="ghost"
            onPress={() => setStep("threshold")}
          />
        </View>
      )}
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
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

  thresholdCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  thresholdValue: {
    fontSize: 44,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },

  // Profile summary card (screenshot-worthy).
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  profileBrand: {
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 3,
    fontSize: font.small,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.primary, fontSize: 40, fontWeight: "800" },
  profileName: { color: "#fff", fontSize: font.h1, fontWeight: "800" },
  profileSub: {
    color: "#D9E5E5",
    fontSize: font.body,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignSelf: "stretch",
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  statNum: { color: "#fff", fontSize: font.h2, fontWeight: "800" },
  statLabel: { color: "#B9CACA", fontSize: font.small, marginTop: 2 },
  profileTriggersLabel: {
    color: "#B9CACA",
    fontSize: font.small,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  profileChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignSelf: "flex-start",
  },
  profileChip: {
    backgroundColor: "rgba(224,164,88,0.18)",
    borderRadius: radius.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  profileChipText: { color: colors.accent, fontWeight: "600", fontSize: font.small },
  profileFooter: {
    color: "#D9E5E5",
    marginTop: spacing.lg,
    fontStyle: "italic",
  },
});
