/**
 * Expenses — log child-related costs with receipt photos and a who-paid split,
 * and show the running balance. This list + the balance is, on its own, worth
 * the subscription to many users.
 *
 * Split model: the other party's share % is configurable per case (default 50)
 * and can be overridden per expense. "I paid" means they owe their share; "they
 * paid" means you owe your share (a negative balance); "shared" nets to zero.
 * See src/data/expense.ts for the math.
 *
 * Edit/delete follows the §2 policy: editable fields can change and record an
 * `editedAt` stamp; createdAt and the hash-chain anchors are never mutated.
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
import {
  Body,
  Button,
  Card,
  DateTimeField,
  H2,
  Muted,
} from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { store, uid } from "@/data/store";
import { balanceLabel, fmtMoney } from "@/report/buildReport";
import { clampPct, owedFor } from "@/data/expense";
import type { Attachment, Expense, ExpenseSplit } from "@/data/types";

const SPLITS: { kind: ExpenseSplit; label: string }[] = [
  { kind: "i_paid", label: "I paid" },
  { kind: "shared", label: "Shared" },
  { kind: "they_paid", label: "They paid" },
];

const emptyForm = () => ({
  desc: "",
  amount: "",
  split: "i_paid" as ExpenseSplit,
  overrideText: "",
  attachments: [] as Attachment[],
  occurredAt: new Date().toISOString(),
});

export default function Expenses() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [sharePct, setSharePct] = useState(50);
  const [sharePctText, setSharePctText] = useState("50");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState(0);

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const load = useCallback(async () => {
    const c = await store.getCase();
    if (!c) return;
    setCaseId(c.id);
    setSharePct(c.otherPartySharePct);
    setSharePctText(String(c.otherPartySharePct));
    setExpenses(await store.getExpenses(c.id));
    setBalance(await store.getBalanceOwedCents(c.id));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function commitSharePct() {
    const pct = clampPct(parseInt(sharePctText, 10));
    setSharePct(pct);
    setSharePctText(String(pct));
    await store.updateCase({ otherPartySharePct: pct });
    // Note: existing expenses keep their saved owedToMeCents; only new/edited
    // ones use the new default. This preserves the audit trail.
  }

  async function pickReceipt() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      const uri = res.assets[0].uri;
      setForm((f) => ({ ...f, attachments: [...f.attachments, { id: uid(), uri }] }));
    }
  }

  function effectiveSharePct(): number {
    const override = parseInt(form.overrideText, 10);
    return Number.isNaN(override) ? sharePct : clampPct(override);
  }

  function startEdit(e: Expense) {
    setEditId(e.id);
    setForm({
      desc: e.description,
      amount: (e.amountCents / 100).toFixed(2),
      split: e.split,
      overrideText: e.sharePctOverride != null ? String(e.sharePctOverride) : "",
      attachments: e.attachments,
      occurredAt: e.occurredAt,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm());
  }

  async function submit() {
    if (!caseId) return;
    const dollars = parseFloat(form.amount.replace(/[^0-9.]/g, ""));
    if (!form.desc.trim() || isNaN(dollars) || dollars <= 0) return;
    const amountCents = Math.round(dollars * 100);
    const overrideNum = parseInt(form.overrideText, 10);
    const sharePctOverride = Number.isNaN(overrideNum)
      ? undefined
      : clampPct(overrideNum);
    const pct = sharePctOverride ?? sharePct;
    const owedToMeCents = owedFor(form.split, amountCents, pct);

    if (editId) {
      await store.updateExpense(editId, {
        description: form.desc.trim(),
        amountCents,
        split: form.split,
        sharePctOverride,
        owedToMeCents,
        attachments: form.attachments,
        occurredAt: form.occurredAt,
      });
    } else {
      await store.addExpense({
        id: uid(),
        caseId,
        description: form.desc.trim(),
        amountCents,
        split: form.split,
        sharePctOverride,
        owedToMeCents,
        attachments: form.attachments,
        occurredAt: form.occurredAt,
        createdAt: new Date().toISOString(),
      });
    }
    cancelEdit();
    load();
  }

  async function remove(id: string) {
    await store.deleteExpense(id);
    if (editId === id) cancelEdit();
    load();
  }

  const previewOwed = (() => {
    const dollars = parseFloat(form.amount.replace(/[^0-9.]/g, ""));
    if (isNaN(dollars) || dollars <= 0) return null;
    return owedFor(form.split, Math.round(dollars * 100), effectiveSharePct());
  })();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={{ backgroundColor: colors.accent }}>
        <Text style={styles.balLabel}>{balanceLabel(balance)}</Text>
        <Text style={styles.balAmount}>{fmtMoney(Math.abs(balance))}</Text>
      </Card>

      <Card>
        <Body>Their share of shared costs</Body>
        <Muted>
          Default percentage the other parent is responsible for. Applies to new
          and edited expenses.
        </Muted>
        <View style={styles.pctRow}>
          <TextInput
            value={sharePctText}
            onChangeText={setSharePctText}
            onBlur={commitSharePct}
            keyboardType="number-pad"
            style={[styles.input, styles.pctInput]}
          />
          <Text style={styles.pctSign}>%</Text>
        </View>
      </Card>

      <H2>{editId ? "Edit expense" : "Add an expense"}</H2>
      <TextInput
        value={form.desc}
        onChangeText={(desc) => setForm((f) => ({ ...f, desc }))}
        placeholder="e.g. Soccer registration"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={form.amount}
        onChangeText={(amount) => setForm((f) => ({ ...f, amount }))}
        placeholder="Amount, e.g. 120.00"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <View style={styles.chips}>
        {SPLITS.map((s) => {
          const on = form.split === s.kind;
          return (
            <Pressable
              key={s.kind}
              onPress={() => setForm((f) => ({ ...f, split: s.kind }))}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.sm }} />
      <Body>Override their share for this expense (optional)</Body>
      <View style={styles.pctRow}>
        <TextInput
          value={form.overrideText}
          onChangeText={(overrideText) => setForm((f) => ({ ...f, overrideText }))}
          placeholder={String(sharePct)}
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          style={[styles.input, styles.pctInput]}
        />
        <Text style={styles.pctSign}>%</Text>
      </View>

      <View style={{ height: spacing.md }} />
      <DateTimeField
        label="When was this expense?"
        value={form.occurredAt}
        onChange={(occurredAt) => setForm((f) => ({ ...f, occurredAt }))}
      />

      <View style={{ height: spacing.md }} />
      <Button label="📎 Attach receipt" variant="secondary" onPress={pickReceipt} />
      <View style={styles.thumbs}>
        {form.attachments.map((a) => (
          <Pressable
            key={a.id}
            onLongPress={() =>
              setForm((f) => ({
                ...f,
                attachments: f.attachments.filter((x) => x.id !== a.id),
              }))
            }
          >
            <Image source={{ uri: a.uri }} style={styles.thumb} />
          </Pressable>
        ))}
      </View>

      {previewOwed != null ? (
        <Muted>
          {previewOwed > 0
            ? `They will owe you ${fmtMoney(previewOwed)}`
            : previewOwed < 0
            ? `You will owe them ${fmtMoney(Math.abs(previewOwed))}`
            : "Nets to zero"}
        </Muted>
      ) : null}

      <View style={{ height: spacing.sm }} />
      <Button label={editId ? "Save changes" : "Add expense"} onPress={submit} />
      {editId ? (
        <>
          <View style={{ height: spacing.sm }} />
          <Button label="Cancel" variant="ghost" onPress={cancelEdit} />
        </>
      ) : null}

      <View style={{ height: spacing.lg }} />
      <H2>Logged expenses</H2>
      {expenses.length === 0 ? (
        <Muted>Nothing logged yet.</Muted>
      ) : (
        expenses.map((e) => (
          <Pressable key={e.id} onPress={() => startEdit(e)}>
            <Card>
              <Body>
                {e.description} — {fmtMoney(e.amountCents)}
              </Body>
              <Muted>
                {e.split} ·{" "}
                {e.owedToMeCents >= 0
                  ? `owed to you ${fmtMoney(e.owedToMeCents)}`
                  : `you owe ${fmtMoney(Math.abs(e.owedToMeCents))}`}{" "}
                · {new Date(e.occurredAt).toLocaleDateString()}
                {e.editedAt ? " · edited" : ""}
              </Muted>
              <View style={{ height: spacing.sm }} />
              <Button
                label="Delete"
                variant="danger"
                onPress={() => remove(e.id)}
              />
            </Card>
          </Pressable>
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
  pctRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pctInput: { width: 90 },
  pctSign: { fontSize: 18, color: colors.text, marginTop: spacing.sm },
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
