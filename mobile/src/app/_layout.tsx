import React, { useEffect } from "react";
import {
  I18nManager,
  Platform,
  Text,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Alexandria_400Regular,
  Alexandria_500Medium,
  Alexandria_600SemiBold,
  Alexandria_700Bold,
  Alexandria_800ExtraBold,
} from "@expo-google-fonts/alexandria";
import { AuthProvider } from "../lib/auth";
import { colors, font } from "../lib/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Alexandria_400Regular,
    Alexandria_500Medium,
    Alexandria_600SemiBold,
    Alexandria_700Bold,
    Alexandria_800ExtraBold,
  });

  useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: "#fff",
          headerTitleStyle: { fontFamily: font.extrabold, fontSize: 17 },
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="horse/[id]" options={{ title: "بطاقة الحصان" }} />
        <Stack.Screen name="auction/[id]" options={{ title: "غرفة المزاد" }} />
        <Stack.Screen name="sell" options={{ title: "بيع حصانك" }} />
        <Stack.Screen name="login" options={{ title: "تسجيل الدخول" }} />
        <Stack.Screen name="register" options={{ title: "حساب جديد" }} />
      </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
