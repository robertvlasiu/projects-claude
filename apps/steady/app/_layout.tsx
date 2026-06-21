import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Steady" }} />
        <Stack.Screen
          name="onboarding"
          options={{ title: "Welcome", headerShown: false }}
        />
        <Stack.Screen name="walk" options={{ title: "Walk Mode" }} />
        <Stack.Screen name="progress" options={{ title: "Progress" }} />
        <Stack.Screen name="paywall" options={{ presentation: "modal", title: "Steady Premium" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
