/**
 * Custody exchanges — log scheduled handoffs and whether they actually
 * happened (and when). "Scheduled vs actual" with a one-tap "did not occur" is
 * the pattern attorneys ask for. MVP uses "now" as the scheduled time; a proper
 * date/time picker is a documented TODO.
 */
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Body, Button, Card, H2, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import type { ExchangeEvent } from "@/data/types";

export default function Exchanges() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [items, setItems] = useState<ExchangeEvent[]>([]);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const c = await store.getCase();
    if (!c) return;
    setCaseId(c.id);
    setItems(await store.getExchanges(c.id));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function record(occurred: boolean) {
    if (!caseId) return;
    const now = new Date().toISOString();
    await store.saveExchange({
      id: uid(),
      caseId,
      scheduledAt: now, // TODO: date/time picker
      actualAt: occurred ? now : null,
      occurred,
      note: note.trim() || undefined,
      createdAt: now,
    });
    setNote("");
    load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H2>Record an exchange</H2>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Optional note (e.g. 40 min late, no notice)"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <View style={{ height: spacing.sm }} />
      <Button label="✓ Exchange occurred" onPress={() => record(true)} />
      <View style={{ height: spacing.sm }} />
      <Button
        label="✕ Did NOT occur"
        variant="danger"
        onPress={() => record(false)}
      />

      <View style={{ height: spacing.lg }} />
      <H2>History</H2>
      {items.length === 0 ? (
        <Muted>No exchanges logged yet.</Muted>
      ) : (
        items.map((x) => (
          <Card key={x.id}>
            <Body>
              {x.occurred ? "✓ Occurred" : "✕ Did not occur"}
            </Body>
            <Muted>
              Scheduled {new Date(x.scheduledAt).toLocaleString()}
              {x.note ? ` · ${x.note}` : ""}
            </Muted>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
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
});
