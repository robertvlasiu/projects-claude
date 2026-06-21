/**
 * Custody exchanges — log scheduled handoffs and whether they actually happened
 * (and when). "Scheduled vs actual" with a one-tap "did not occur" is the
 * pattern attorneys ask for. The scheduled (and actual) times are set with a
 * real date/time picker; createdAt is stamped at save and never editable.
 *
 * Edit/delete follows the §2 policy: editable fields can change and record an
 * `editedAt` stamp; createdAt and the hash-chain anchors are never mutated.
 */
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Body, Button, Card, DateTimeField, H2, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import type { ExchangeEvent } from "@/data/types";

export default function Exchanges() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [items, setItems] = useState<ExchangeEvent[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString());
  const [occurred, setOccurred] = useState<boolean | null>(null);
  const [actualAt, setActualAt] = useState(new Date().toISOString());

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

  function resetForm() {
    setEditId(null);
    setNote("");
    setScheduledAt(new Date().toISOString());
    setOccurred(null);
    setActualAt(new Date().toISOString());
  }

  function startEdit(x: ExchangeEvent) {
    setEditId(x.id);
    setNote(x.note ?? "");
    setScheduledAt(x.scheduledAt);
    setOccurred(x.occurred);
    setActualAt(x.actualAt ?? x.scheduledAt);
  }

  async function save(didOccur: boolean) {
    if (!caseId) return;
    const fields = {
      scheduledAt,
      actualAt: didOccur ? actualAt : null,
      occurred: didOccur,
      note: note.trim() || undefined,
    };
    if (editId) {
      await store.updateExchange(editId, fields);
    } else {
      await store.addExchange({
        id: uid(),
        caseId,
        ...fields,
        createdAt: new Date().toISOString(),
      });
    }
    resetForm();
    load();
  }

  async function remove(id: string) {
    await store.deleteExchange(id);
    if (editId === id) resetForm();
    load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H2>{editId ? "Edit exchange" : "Record an exchange"}</H2>

      <View style={{ height: spacing.sm }} />
      <DateTimeField
        label="Scheduled time"
        value={scheduledAt}
        onChange={setScheduledAt}
      />

      <View style={{ height: spacing.md }} />
      <Body>Actual handoff time (if it occurred)</Body>
      <DateTimeField label="" value={actualAt} onChange={setActualAt} />

      <View style={{ height: spacing.md }} />
      <Body>Note</Body>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Optional note (e.g. 40 min late, no notice)"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={{ height: spacing.md }} />
      <Button label="✓ Exchange occurred" onPress={() => save(true)} />
      <View style={{ height: spacing.sm }} />
      <Button
        label="✕ Did NOT occur"
        variant="danger"
        onPress={() => save(false)}
      />
      {editId ? (
        <>
          <View style={{ height: spacing.sm }} />
          <Button label="Cancel edit" variant="ghost" onPress={resetForm} />
        </>
      ) : null}

      <View style={{ height: spacing.lg }} />
      <H2>History</H2>
      {items.length === 0 ? (
        <Muted>No exchanges logged yet.</Muted>
      ) : (
        items.map((x) => (
          <Pressable key={x.id} onPress={() => startEdit(x)}>
            <Card>
              <Body>{x.occurred ? "✓ Occurred" : "✕ Did not occur"}</Body>
              <Muted>
                Scheduled {new Date(x.scheduledAt).toLocaleString()}
                {x.occurred && x.actualAt
                  ? ` · actual ${new Date(x.actualAt).toLocaleString()}`
                  : ""}
                {x.note ? ` · ${x.note}` : ""}
                {x.editedAt ? " · edited" : ""}
              </Muted>
              <View style={{ height: spacing.sm }} />
              <Button label="Delete" variant="danger" onPress={() => remove(x.id)} />
            </Card>
          </Pressable>
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
