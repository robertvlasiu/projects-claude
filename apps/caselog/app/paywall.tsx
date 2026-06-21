/**
 * Paywall (modal). Triggered when a free user tries to export. Reads offerings
 * from the subscriptions module (mock until RevenueCat is wired). MVP tasks:
 * Terms/Privacy links (App Store requirement), trial messaging, real Restore.
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
    if (await subscriptions.purchase(id)) router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <H1>Unlock unlimited exports</H1>
      <Body>
        Keep logging for free. Subscribe to generate attorney-ready PDF reports
        whenever you need them.
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
        Caselog organizes personal documentation. It is not legal advice.
      </Muted>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingTop: spacing.xl },
});
