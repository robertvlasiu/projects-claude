/**
 * Paywall (modal). Reads offerings from the subscriptions module (mock until
 * RevenueCat is wired). MVP tasks: real package selection UI, "restore", links
 * to Terms/Privacy (App Store requirement), and trial messaging.
 */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Card, H1, Muted } from "@/components/ui";
import { spacing } from "@/theme";
import { subscriptions } from "@/subscriptions";

export default function Paywall() {
  const [offers, setOffers] = useState<
    { id: string; priceString: string; period: string }[]
  >([]);

  useEffect(() => {
    subscriptions.getOfferings().then(setOffers);
  }, []);

  async function buy(id: string) {
    const ok = await subscriptions.purchase(id);
    if (ok) router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Unlock the full plan</H1>
      <Body>
        Every protocol, threshold tracking, and your full progress history — to
        keep walks getting calmer.
      </Body>

      <View style={{ height: spacing.lg }} />
      {offers.map((o) => (
        <Card key={o.id}>
          <Body>
            {o.priceString} / {o.period}
          </Body>
          <View style={{ height: spacing.sm }} />
          <Button label={`Subscribe (${o.period})`} onPress={() => buy(o.id)} />
        </Card>
      ))}

      <Button
        label="Restore purchases"
        variant="ghost"
        onPress={() => subscriptions.restore()}
      />
      <Muted>
        Reviewed with a certified trainer. Not a substitute for professional
        behavioral help in serious cases.
      </Muted>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
});
