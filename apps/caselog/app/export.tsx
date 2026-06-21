/**
 * Export — the premium payoff. Builds the HTML report, renders a PDF with
 * expo-print, and shares it (to email the attorney, save to Files, etc.).
 * Gated behind the subscription: free users can log everything but must
 * subscribe to export — the moment of clearest value, so the best paywall trigger.
 */
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { router } from "expo-router";
import { Body, Button, Card, H1, Muted } from "@/components/ui";
import { spacing } from "@/theme";
import { store } from "@/data/store";
import { buildReportHtml } from "@/report/buildReport";
import { subscriptions } from "@/subscriptions";

export default function ExportReport() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function exportPdf() {
    setBusy(true);
    setStatus(null);
    try {
      if (!(await subscriptions.isSubscribed())) {
        router.push("/paywall");
        return;
      }
      const c = await store.getCase();
      if (!c) return;
      const [incidents, expenses, exchanges] = await Promise.all([
        store.getIncidents(c.id),
        store.getExpenses(c.id),
        store.getExchanges(c.id),
      ]);
      const html = buildReportHtml({ profile: c, incidents, expenses, exchanges });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Send report to your attorney",
        });
      } else {
        setStatus(`Saved: ${uri}`);
      }
    } catch (e) {
      setStatus(`Could not export: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Export your report</H1>
      <Body>
        Generate a clean, chronological PDF of every incident, expense, and
        exchange — ready to email to your attorney or mediator.
      </Body>

      <View style={{ height: spacing.lg }} />
      <Card>
        <Body>The report includes:</Body>
        <Muted>• Timestamped incident log with attachments</Muted>
        <Muted>• Expense ledger and the balance owed to you</Muted>
        <Muted>• Custody exchange history (scheduled vs actual)</Muted>
      </Card>

      <Button
        label={busy ? "Preparing…" : "📄 Generate PDF"}
        onPress={exportPdf}
        disabled={busy}
      />
      {status ? <Muted>{status}</Muted> : null}

      <View style={{ height: spacing.md }} />
      <Muted>
        Caselog organizes personal documentation to share with your attorney. It
        is not legal advice and makes no claim about admissibility.
      </Muted>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
});
