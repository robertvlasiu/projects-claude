/**
 * Walk Mode — the retention-critical, one-handed logging screen.
 *
 * Design rule: BIG buttons, usable while holding a leash. Starts a Walk on
 * mount, lets the owner tap a trigger → distance → intensity to log a
 * TriggerEvent, then end the walk with an overall 1–5 rating.
 *
 *  - Haptics on every tap (expo-haptics).
 *  - Screen stays awake for the whole walk (expo-keep-awake).
 *  - Every event is persisted immediately, so a force-quit never loses a walk.
 */
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { Button, H2, Muted } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme";
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

type Phase = "trigger" | "distance" | "intensity" | "rating";

function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export default function WalkMode() {
  useKeepAwake();
  const walkRef = useRef<Walk | null>(null);
  const [dog, setDog] = useState<Dog | null>(null);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("trigger");
  const [pending, setPending] = useState<TriggerKind | null>(null);
  const [distance, setDistance] = useState(20);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const dogs = await store.getDogs();
      if (!dogs[0]) {
        router.replace("/onboarding");
        return;
      }
      if (!active) return;
      setDog(dogs[0]);
      setDistance(dogs[0].baselineThresholdFt ?? 20);
      walkRef.current = {
        id: uid(),
        dogId: dogs[0].id,
        startedAt: new Date().toISOString(),
        events: [],
      };
      await store.saveWalk(walkRef.current);
    })();
    return () => {
      active = false;
    };
  }, []);

  function selectTrigger(kind: TriggerKind) {
    tap();
    setPending(kind);
    setDistance(dog?.baselineThresholdFt ?? 20);
    setPhase("distance");
  }

  function stepDistance(delta: number) {
    Haptics.selectionAsync().catch(() => {});
    setDistance((d) => Math.max(0, Math.min(200, d + delta)));
  }

  async function logIntensity(intensity: 1 | 2 | 3 | 4 | 5) {
    if (!walkRef.current || !pending) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    const event: TriggerEvent = {
      id: uid(),
      walkId: walkRef.current.id,
      trigger: pending,
      distanceFt: distance,
      intensity,
      at: new Date().toISOString(),
    };
    walkRef.current.events.push(event);
    await store.saveWalk(walkRef.current); // incremental save (crash-safe)
    setPending(null);
    setPhase("trigger");
    setCount((c) => c + 1);
  }

  async function finishWalk(overall?: 1 | 2 | 3 | 4 | 5) {
    if (saving) return;
    setSaving(true);
    if (walkRef.current) {
      walkRef.current.endedAt = new Date().toISOString();
      if (overall) walkRef.current.overall = overall;
      await store.saveWalk(walkRef.current);
    }
    router.replace("/progress");
  }

  if (!dog) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H2>Walking {dog.name}</H2>
      <Muted>
        {count} reaction{count === 1 ? "" : "s"} logged this walk
      </Muted>

      {phase === "trigger" && (
        <>
          <Text style={styles.prompt}>Tap what you saw:</Text>
          <View style={styles.grid}>
            {QUICK_TRIGGERS.map((t) => (
              <Pressable
                key={t.kind}
                style={styles.bigBtn}
                onPress={() => selectTrigger(t.kind)}
              >
                <Text style={styles.bigBtnText}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ height: spacing.xl }} />
          <Button
            label="End walk"
            variant="ghost"
            onPress={() => {
              tap();
              setPhase("rating");
            }}
          />
        </>
      )}

      {phase === "distance" && (
        <>
          <Text style={styles.prompt}>How close did it get?</Text>
          <View style={styles.stepperRow}>
            <Pressable style={styles.stepBtn} onPress={() => stepDistance(-5)}>
              <Text style={styles.stepBtnText}>−5</Text>
            </Pressable>
            <View style={styles.distanceBox}>
              <Text style={styles.distanceNum}>{distance}</Text>
              <Text style={styles.distanceUnit}>feet</Text>
            </View>
            <Pressable style={styles.stepBtn} onPress={() => stepDistance(5)}>
              <Text style={styles.stepBtnText}>+5</Text>
            </Pressable>
          </View>
          <View style={{ height: spacing.lg }} />
          <Button
            label="Next"
            onPress={() => {
              tap();
              setPhase("intensity");
            }}
          />
          <View style={{ height: spacing.sm }} />
          <Button
            label="Skip distance"
            variant="ghost"
            onPress={() => {
              tap();
              setPhase("intensity");
            }}
          />
        </>
      )}

      {phase === "intensity" && (
        <>
          <Text style={styles.prompt}>How intense was the reaction?</Text>
          <View style={styles.grid}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[
                  styles.bigBtn,
                  { backgroundColor: colors.intensity[n - 1] },
                ]}
                onPress={() => logIntensity(n as 1 | 2 | 3 | 4 | 5)}
              >
                <Text style={[styles.bigBtnText, { color: "#fff" }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Muted>1 = noticed &amp; calm · 5 = full explosion</Muted>
        </>
      )}

      {phase === "rating" && (
        <>
          <Text style={styles.prompt}>How was the walk overall?</Text>
          <View style={styles.grid}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[
                  styles.bigBtn,
                  { backgroundColor: colors.intensity[5 - n] },
                ]}
                onPress={() => finishWalk(n as 1 | 2 | 3 | 4 | 5)}
              >
                <Text style={[styles.bigBtnText, { color: "#fff" }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Muted>1 = rough · 5 = our best walk yet</Muted>
          <View style={{ height: spacing.lg }} />
          <Button
            label="Finish without rating"
            variant="ghost"
            onPress={() => finishWalk()}
            disabled={saving}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  prompt: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 18,
    color: colors.text,
  },
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

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  stepBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  distanceBox: { alignItems: "center", minWidth: 110 },
  distanceNum: { fontSize: 52, fontWeight: "800", color: colors.text },
  distanceUnit: { fontSize: font.body, color: colors.textMuted },
});
