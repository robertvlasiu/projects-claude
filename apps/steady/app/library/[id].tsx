/**
 * Protocol detail / guided session runner.
 *
 * Gating: if the protocol is premium and the user isn't subscribed, redirect to
 * the paywall. The step list runs one-step-at-a-time with next/back; finishing
 * writes a ProtocolSession with an optional reflection note.
 */
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Body, Button, Card, H1, H2, Muted } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme";
import { getProtocol } from "@/data/seed";
import { store, uid } from "@/data/store";
import { subscriptions } from "@/subscriptions";

export default function ProtocolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const protocol = getProtocol(id);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!protocol) return;
      if (!protocol.premium) {
        if (active) setAllowed(true);
        return;
      }
      const subbed = await subscriptions.isSubscribed();
      if (!active) return;
      if (!subbed) {
        router.replace("/paywall");
        return;
      }
      setAllowed(true);
    })();
    return () => {
      active = false;
    };
  }, [protocol]);

  async function complete() {
    if (saving) return;
    setSaving(true);
    const dogs = await store.getDogs();
    if (dogs[0] && protocol) {
      await store.addSession({
        id: uid(),
        dogId: dogs[0].id,
        protocolId: protocol.id,
        completedAt: new Date().toISOString(),
        notes: note.trim() || undefined,
      });
    }
    router.back();
  }

  if (!protocol) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Not found" }} />
        <Body>Protocol not found.</Body>
      </View>
    );
  }
  if (allowed === null) return null;

  const lastStep = stepIdx === protocol.steps.length - 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: protocol.title }} />

      {!started ? (
        <>
          <H1>{protocol.title}</H1>
          <Muted>
            {protocol.durationMin} min · {protocol.steps.length} steps
          </Muted>
          <View style={{ height: spacing.md }} />
          <Body>{protocol.summary}</Body>
          <View style={{ height: spacing.lg }} />
          <Button
            label="Start guided session"
            onPress={() => {
              setStepIdx(0);
              setStarted(true);
            }}
          />
        </>
      ) : (
        <>
          <Muted>
            Step {stepIdx + 1} of {protocol.steps.length}
          </Muted>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((stepIdx + 1) / protocol.steps.length) * 100}%`,
                },
              ]}
            />
          </View>

          <Card style={{ marginTop: spacing.lg, minHeight: 160 }}>
            <Text style={styles.stepNum}>STEP {stepIdx + 1}</Text>
            <H2>{protocol.steps[stepIdx]}</H2>
          </Card>

          {lastStep && (
            <Card>
              <Body>How did it go? (optional)</Body>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="A quick reflection — calmer than last time?"
                placeholderTextColor={colors.textMuted}
                style={styles.note}
                multiline
              />
            </Card>
          )}

          <View style={{ height: spacing.md }} />
          {!lastStep ? (
            <Button label="Next step" onPress={() => setStepIdx((i) => i + 1)} />
          ) : (
            <Button
              label={saving ? "Saving…" : "Finish session ✓"}
              onPress={complete}
              disabled={saving}
            />
          )}
          <View style={{ height: spacing.sm }} />
          <Button
            label="Back"
            variant="ghost"
            onPress={() => {
              if (stepIdx === 0) setStarted(false);
              else setStepIdx((i) => i - 1);
            }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  stepNum: {
    color: colors.accent,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    fontSize: font.small,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  note: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.body,
    color: colors.text,
    marginTop: spacing.sm,
    minHeight: 70,
    textAlignVertical: "top",
  },
});
