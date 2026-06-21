/**
 * Walk Mode — the retention-critical, one-handed logging screen.
 *
 * Design rule: BIG buttons, usable while holding a leash. This scaffold starts
 * a Walk on mount and lets the owner tap a trigger + intensity to log a
 * TriggerEvent. MVP tasks (see BUILD_TO_MVP.md):
 *  - Add distance capture (quick stepper) and an "end walk + overall rating".
 *  - Haptics on each tap. Keep the screen awake during a walk.
 *  - Persist incrementally so a crash never loses a walk.
 */
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, H2, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import type { Dog, TriggerEvent, TriggerKind, Walk } from "@/data/types";

const QUICK_TRIGGERS: { kind: TriggerKind; label: string }[] = [
  { kind: "other_dogs", label: "🐕 Dog" },
  { kind: "men", label: "🚶 Person" },
  { kind: "bikes", label: "🚲 Bike" },
  { kind: "cars", label: "🚗 Car" },
  { kind: "loud_noises", label: "🔊 Noise" },
  { kind: "other", label: "❓ Other" },
];

export default function WalkMode() {
  const walkRef = useRef<Walk | null>(null);
  const [dog, setDog] = useState<Dog | null>(null);
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState<TriggerKind | null>(null);

  useEffect(() => {
    (async () => {
      const dogs = await store.getDogs();
      if (!dogs[0]) return router.replace("/onboarding");
      setDog(dogs[0]);
      walkRef.current = {
        id: uid(),
        dogId: dogs[0].id,
        startedAt: new Date().toISOString(),
        events: [],
      };
      await store.saveWalk(walkRef.current);
    })();
  }, []);

  async function logIntensity(intensity: 1 | 2 | 3 | 4 | 5) {
    if (!walkRef.current || !pending) return;
    const event: TriggerEvent = {
      id: uid(),
      walkId: walkRef.current.id,
      trigger: pending,
      intensity,
      at: new Date().toISOString(),
    };
    walkRef.current.events.push(event);
    await store.saveWalk(walkRef.current); // incremental save
    setPending(null);
    setCount((c) => c + 1);
  }

  async function endWalk() {
    if (walkRef.current) {
      walkRef.current.endedAt = new Date().toISOString();
      await store.saveWalk(walkRef.current);
    }
    router.replace("/progress");
  }

  if (!dog) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H2>Walking {dog.name}</H2>
      <Muted>{count} reactions logged this walk</Muted>

      {!pending ? (
        <>
          <Text style={styles.prompt}>Tap what you saw:</Text>
          <View style={styles.grid}>
            {QUICK_TRIGGERS.map((t) => (
              <Pressable
                key={t.kind}
                style={styles.bigBtn}
                onPress={() => setPending(t.kind)}
              >
                <Text style={styles.bigBtnText}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.prompt}>How intense was the reaction?</Text>
          <View style={styles.grid}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[styles.bigBtn, { backgroundColor: colors.intensity[n - 1] }]}
                onPress={() => logIntensity(n as 1 | 2 | 3 | 4 | 5)}
              >
                <Text style={[styles.bigBtnText, { color: "#fff" }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Muted>1 = noticed &amp; calm · 5 = full explosion</Muted>
        </>
      )}

      <View style={{ height: spacing.xl }} />
      <Button label="End walk" variant="ghost" onPress={endWalk} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  prompt: { marginTop: spacing.lg, marginBottom: spacing.md, fontSize: 18, color: colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  bigBtn: {
    width: "47%",
    aspectRatio: 1.6,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bigBtnText: { fontSize: 22, fontWeight: "700", color: colors.text },
});
