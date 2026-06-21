/**
 * Dashboard — the home screen. Shows the running balance owed, a unified recent
 * timeline, and quick actions into the three log types + export.
 */
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Body, Button, Card, H1, H2, Muted } from "@/components/ui";
import { colors, spacing } from "@/theme";
import { store } from "@/data/store";
import { fmtMoney } from "@/report/buildReport";
import type { CaseProfile, IncidentEntry } from "@/data/types";

export default function Dashboard() {
  const [profile, setProfile] = useState<CaseProfile | null>(null);
  const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const c = await store.getCase();
        if (!c) {
          router.replace("/onboarding");
          return;
        }
        const [inc, bal] = await Promise.all([
          store.getIncidents(c.id),
          store.getBalanceOwedCents(c.id),
        ]);
        if (!active) return;
        setProfile(c);
        setIncidents(inc);
        setBalance(bal);
        setReady(true);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  if (!ready || !profile) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>{profile.label}</H1>
      <Muted>
        {profile.childrenFirstNames.join(", ") || "Your records, organized."}
      </Muted>

      <Card style={{ marginTop: spacing.lg, backgroundColor: colors.primary }}>
        <Text style={styles.balanceLabel}>Balance owed to you</Text>
        <Text style={styles.balanceAmount}>{fmtMoney(balance)}</Text>
      </Card>

      <View style={styles.actions}>
        <Button label="＋ Log incident" onPress={() => router.push("/incident")} />
        <View style={{ height: spacing.sm }} />
        <Button
          label="Expenses"
          variant="secondary"
          onPress={() => router.push("/expenses")}
        />
        <View style={{ height: spacing.sm }} />
        <Button
          label="Custody exchanges"
          variant="secondary"
          onPress={() => router.push("/exchanges")}
        />
        <View style={{ height: spacing.sm }} />
        <Button
          label="📄 Export report for attorney"
          variant="ghost"
          onPress={() => router.push("/export")}
        />
      </View>

      <H2>Recent</H2>
      {incidents.length === 0 ? (
        <Muted>No incidents logged yet. Tap “Log incident” to start.</Muted>
      ) : (
        incidents.slice(0, 10).map((i) => (
          <Card key={i.id}>
            <Body>{i.title}</Body>
            <Muted>
              {new Date(i.occurredAt).toLocaleString()} · {i.category}
            </Muted>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
  actions: { marginVertical: spacing.lg },
  balanceLabel: { color: "#C5CCD8", fontSize: 13 },
  balanceAmount: { color: "#fff", fontSize: 34, fontWeight: "700", marginTop: spacing.xs },
});
