/**
 * Protocol detail / session runner.
 *
 * Gating: if the protocol is premium and the user isn't subscribed, redirect to
 * the paywall. MVP task: turn the step list into a guided, one-step-at-a-time
 * session with a "mark complete" that writes a ProtocolSession.
 */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Body, Button, Card, H1, Muted } from "@/components/ui";
import { colors, spacing } from "@/theme";
import { getProtocol } from "@/data/seed";
import { store, uid } from "@/data/store";
import { subscriptions } from "@/subscriptions";

export default function ProtocolDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const protocol = getProtocol(id);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      if (!protocol) return;
      if (!protocol.premium) return setAllowed(true);
      const subbed = await subscriptions.isSubscribed();
      if (!subbed) {
        router.replace("/paywall");
        return;
      }
      setAllowed(true);
    })();
  }, [protocol]);

  async function complete() {
    const dogs = await store.getDogs();
    if (dogs[0] && protocol) {
      await store.addSession({
        id: uid(),
        dogId: dogs[0].id,
        protocolId: protocol.id,
        completedAt: new Date().toISOString(),
      });
    }
    router.back();
  }

  if (!protocol) return <Body>Protocol not found.</Body>;
  if (allowed === null) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: protocol.title }} />
      <H1>{protocol.title}</H1>
      <Muted>
        {protocol.durationMin} min · {protocol.summary}
      </Muted>

      <View style={{ height: spacing.lg }} />
      {protocol.steps.map((step, i) => (
        <Card key={i}>
          <Text style={styles.stepNum}>Step {i + 1}</Text>
          <Body>{step}</Body>
        </Card>
      ))}

      <View style={{ height: spacing.md }} />
      <Button label="Mark session complete" onPress={complete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  stepNum: { color: colors.accent, fontWeight: "700", marginBottom: spacing.xs },
});
