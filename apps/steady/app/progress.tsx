/**
 * Progress — the retention + virality hook ("Day 1 vs Day 40").
 *
 * This scaffold computes simple aggregates from logged walks. MVP tasks:
 *  - Add a real chart (avg intensity over time, threshold distance shrinking).
 *  - Add a shareable "progress card" export (react-native-view-shot) — this is
 *    your TikTok marketing engine. See BUILD_TO_MVP.md.
 */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Body, Card, H1, H2, Muted } from "@/components/ui";
import { spacing } from "@/theme";
import { store } from "@/data/store";
import type { Walk } from "@/data/types";

export default function Progress() {
  const [walks, setWalks] = useState<Walk[]>([]);

  useEffect(() => {
    (async () => {
      const dogs = await store.getDogs();
      if (dogs[0]) setWalks(await store.getWalks(dogs[0].id));
    })();
  }, []);

  const totalEvents = walks.reduce((n, w) => n + w.events.length, 0);
  const avgIntensity =
    totalEvents === 0
      ? 0
      : walks
          .flatMap((w) => w.events)
          .reduce((s, e) => s + e.intensity, 0) / totalEvents;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Progress</H1>
      <Muted>Proof that the small reps are adding up.</Muted>

      <View style={{ height: spacing.lg }} />
      <Card>
        <H2>{walks.length}</H2>
        <Muted>walks logged</Muted>
      </Card>
      <Card>
        <H2>{avgIntensity.toFixed(1)}</H2>
        <Muted>average reaction intensity (lower is better)</Muted>
      </Card>

      {/* TODO(agent): replace with a real trend chart + shareable card. */}
      <Card>
        <Body>📈 Chart goes here — see BUILD_TO_MVP.md.</Body>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
});
