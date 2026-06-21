/**
 * Home / "Today" screen.
 *
 *  - On first launch, redirect to /onboarding if no dog exists.
 *  - Pick today's protocol from the dog's triggers + recent sessions.
 *  - Show a streak counter, plus quick links to Walk Mode and Progress.
 *
 * Reloads on focus so streak/suggestion stay fresh after a session or walk.
 */
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { Body, Button, Card, H1, H2, Muted } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme";
import { store } from "@/data/store";
import { computeStreak, pickTodaysProtocol } from "@/data/logic";
import type { Dog, Protocol } from "@/data/types";

export default function Home() {
  const [dog, setDog] = useState<Dog | null>(null);
  const [todays, setTodays] = useState<Protocol | null>(null);
  const [streak, setStreak] = useState(0);
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const dogs = await store.getDogs();
        if (dogs.length === 0) {
          router.replace("/onboarding");
          return;
        }
        const d = dogs[0];
        const [sessions, walks] = await Promise.all([
          store.getSessions(d.id),
          store.getWalks(d.id),
        ]);
        if (!active) return;
        setDog(d);
        setTodays(pickTodaysProtocol(d, sessions));
        setStreak(computeStreak(sessions, walks));
        setReady(true);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  if (!ready || !dog || !todays) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <H1>Hi {dog.name} 🐾</H1>
          <Muted>Small, calm reps. You're doing the work.</Muted>
        </View>
        {streak > 0 && (
          <View style={styles.streak}>
            <Text style={styles.streakNum}>🔥 {streak}</Text>
            <Text style={styles.streakLabel}>
              day{streak === 1 ? "" : "s"}
            </Text>
          </View>
        )}
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <Muted>TODAY'S SESSION</Muted>
        <View style={{ height: spacing.xs }} />
        <H2>
          {todays.title} {todays.premium ? "🔒" : ""}
        </H2>
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
  header: { flexDirection: "row", alignItems: "flex-start" },
  streak: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  streakNum: { fontSize: font.h3, fontWeight: "800", color: colors.text },
  streakLabel: { fontSize: font.small, color: colors.textMuted },
});
