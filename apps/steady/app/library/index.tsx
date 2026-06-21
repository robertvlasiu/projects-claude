/**
 * Protocol library list. Free protocols are open; premium ones route through
 * the paywall (handled in the detail screen).
 */
import { FlatList, StyleSheet, View } from "react-native";
import { Link, Stack } from "expo-router";
import { Body, Card, Muted } from "@/components/ui";
import { colors, spacing } from "@/theme";
import { PROTOCOLS } from "@/data/seed";

export default function Library() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Protocols" }} />
      <FlatList
        data={PROTOCOLS}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <Link href={`/library/${item.id}`} asChild>
            <Card>
              <Body>
                {item.title} {item.premium ? "🔒" : ""}
              </Body>
              <Muted>
                {item.durationMin} min · {item.summary}
              </Muted>
            </Card>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});
