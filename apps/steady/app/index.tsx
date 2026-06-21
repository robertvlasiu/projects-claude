/**
 * Home / "Today" screen.
 *
 * MVP responsibilities (see BUILD_TO_MVP.md):
 *  - On first launch, redirect to /onboarding if no dog exists.
 *  - Show today's suggested protocol + quick links to Walk Mode and Progress.
 *
 * This scaffold wires the data load + navigation. The agent fleshes out the
 * "today's plan" logic and visual polish.
 */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Link, router } from "expo-router";
import { Body, Button, Card, H1, H2, Muted } from "@/components/ui";
import { spacing } from "@/theme";
import { store } from "@/data/store";
import { PROTOCOLS } from "@/data/seed";
import type { Dog } from "@/data/types";

export default function Home() {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const dogs = await store.getDogs();
      if (dogs.length === 0) {
        router.replace("/onboarding");
        return;
      }
      setDog(dogs[0]);
      setLoading(false);
    })();
  }, []);

  if (loading || !dog) return null;

  // TODO(agent): pick today's protocol based on dog.triggers + recent sessions.
  const todays = PROTOCOLS[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Hi {dog.name} 🐾</H1>
      <Muted>Small, calm reps. You're doing the work.</Muted>

      <Card style={{ marginTop: spacing.lg }}>
        <H2>Today's session</H2>
        <Body>{todays.title}</Body>
        <Muted>
          {todays.durationMin} min · {todays.summary}
        </Muted>
        <View style={{ height: spacing.md }} />
        <Link href={`/library/${todays.id}`} asChild>
          <Button label="Start session" onPress={() => {}} />
        </Link>
      </Card>

      <Button
        label="🚶 Start a walk"
        variant="secondary"
        onPress={() => router.push("/walk")}
      />
      <View style={{ height: spacing.sm }} />
      <Button
        label="View progress"
        variant="ghost"
        onPress={() => router.push("/progress")}
      />
      <View style={{ height: spacing.sm }} />
      <Link href="/library" asChild>
        <Button label="All protocols" variant="ghost" onPress={() => {}} />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
});
