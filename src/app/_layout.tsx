import { supabase } from "@/lib/supabase";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only trigger redirection on explicit login or initial session load
        if (
          session?.user &&
          (event === "SIGNED_IN" || event === "INITIAL_SESSION")
        ) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .single();

          if (profile && !profile.onboarding_completed) {
            router.replace("/onboarding");
          }
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
