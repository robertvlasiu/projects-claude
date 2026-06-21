import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Caselog" }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="incident" options={{ title: "Log incident" }} />
        <Stack.Screen name="expenses" options={{ title: "Expenses" }} />
        <Stack.Screen name="exchanges" options={{ title: "Custody exchanges" }} />
        <Stack.Screen name="export" options={{ title: "Export report" }} />
        <Stack.Screen
          name="paywall"
          options={{ presentation: "modal", title: "Caselog Premium" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
