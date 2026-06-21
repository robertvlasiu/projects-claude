/**
 * Expenses — log child-related costs with receipt photos and a who-paid split,
 * and show the running balance the other parent owes. This list + the balance
 * is, on its own, worth the subscription to many users.
 *
 * MVP split model: "i_paid" assumes a 50/50 share → half is owed to the user.
 * A configurable share % is a documented TODO in BUILD_TO_MVP.md.
 */
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { Body, Button, Card, H2, Muted } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import { fmtMoney } from "@/report/buildReport";
import type { Attachment, Expense, ExpenseSplit } from "@/data/types";

const SPLITS: { kind: ExpenseSplit; label: string }[] = [
  { kind: "i_paid", label: "I paid" },
  { kind: "shared", label: "Shared" },
  { kind: "they_paid", label: "They paid" },
];

function owedFor(split: ExpenseSplit, amountCents: number): number {
  // 50/50 assumption for MVP.
  return split === "i_paid" ? Math.round(amountCents / 2) : 0;
}

export default function Expenses() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState(0);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [split, setSplit] = useState<ExpenseSplit>("i_paid");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const load = useCallback(async () => {
    const c = await store.getCase();
    if (!c) return;
    setCaseId(c.id);
    setExpenses(await store.getExpenses(c.id));
    setBalance(await store.getBalanceOwedCents(c.id));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function pickReceipt() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      setAttachments((a) => [...a, { id: uid(), uri: res.assets[0].uri }]);
    }
  }

  async function add() {
    if (!caseId) return;
    const dollars = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!desc.trim() || isNaN(dollars) || dollars <= 0) return;
    const amountCents = Math.round(dollars * 100);
    const now = new Date().toISOString();
    await store.addExpense({
      id: uid(),
      caseId,
      description: desc.trim(),
      amountCents,
      split,
      owedToMeCents: owedFor(split, amountCents),
      attachments,
      occurredAt: now,
      createdAt: now,
    });
    setDesc("");
    setAmount("");
    setAttachments([]);
    setSplit("i_paid");
    load();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={{ backgroundColor: colors.accent }}>
        <Text style={styles.balLabel}>Balance owed to you</Text>
        <Text style={styles.balAmount}>{fmtMoney(balance)}</Text>
      </Card>

      <H2>Add an expense</H2>
      <TextInput
        value={desc}
        onChangeText={setDesc}
        placeholder="e.g. Soccer registration"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount, e.g. 120.00"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <View style={styles.chips}>
        {SPLITS.map((s) => {
          const on = split === s.kind;
          return (
            <Pressable
              key={s.kind}
              onPress={() => setSplit(s.kind)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button label="📎 Attach receipt" variant="secondary" onPress={pickReceipt} />
      <View style={styles.thumbs}>
        {attachments.map((a) => (
          <Image key={a.id} source={{ uri: a.uri }} style={styles.thumb} />
        ))}
      </View>
      <View style={{ height: spacing.sm }} />
      <Button label="Add expense" onPress={add} />

      <View style={{ height: spacing.lg }} />
      <H2>Logged expenses</H2>
      {expenses.length === 0 ? (
        <Muted>Nothing logged yet.</Muted>
      ) : (
        expenses.map((e) => (
          <Card key={e.id}>
            <Body>
              {e.description} — {fmtMoney(e.amountCents)}
            </Body>
            <Muted>
              {e.split} · owed to you {fmtMoney(e.owedToMeCents)} ·{" "}
              {new Date(e.occurredAt).toLocaleDateString()}
            </Muted>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  balLabel: { color: "#DDEAE8", fontSize: 13 },
  balAmount: { color: "#fff", fontSize: 30, fontWeight: "700", marginTop: spacing.xs },
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextOn: { color: "#fff", fontWeight: "600" },
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
});
