/**
 * Dashboard — the home screen. Shows the running balance owed, a unified recent
 * timeline, and quick actions into the three log types + export.
 */
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Body, Button, Card, H1, H2, Muted } from "@/components/ui";
import { colors, spacing } from "@/theme";
import { store } from "@/data/store";
import { balanceLabel, fmtMoney } from "@/report/buildReport";
import type { CaseProfile, IncidentEntry } from "@/data/types";

export default function Dashboard() {
  const [profile, setProfile] = useState<CaseProfile | null>(null);
  const [incidents, setIncidents] = useState<IncidentEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [integrityOk, setIntegrityOk] = useState(true);
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
        const [inc, bal, integrity] = await Promise.all([
          store.getIncidents(c.id),
          store.getBalanceOwedCents(c.id),
          store.verifyIntegrity(c.id),
        ]);
        if (!active) return;
        setProfile(c);
        setIncidents(inc);
        setBalance(bal);
        setIntegrityOk(integrity.ok);
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
        <Text style={styles.balanceLabel}>{balanceLabel(balance)}</Text>
        <Text style={styles.balanceAmount}>{fmtMoney(Math.abs(balance))}</Text>
      </Card>

      {!integrityOk ? (
        <Card style={{ backgroundColor: "#FBE9E9", borderColor: colors.danger }}>
          <Body>⚠️ Record integrity check failed</Body>
          <Muted>
            The tamper-evidence chain doesn't match. This can happen if storage
            was edited outside the app.
          </Muted>
        </Card>
      ) : null}

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
          <Pressable
            key={i.id}
            onPress={() => router.push({ pathname: "/incident", params: { id: i.id } })}
          >
            <Card>
              <Body>{i.title}</Body>
              <Muted>
                {new Date(i.occurredAt).toLocaleString()} · {i.category}
                {i.editedAt ? " · edited" : ""}
              </Muted>
            </Card>
          </Pressable>
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
