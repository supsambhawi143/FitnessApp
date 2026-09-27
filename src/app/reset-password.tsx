import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ code?: string }>();

  const [exchanging, setExchanging] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    exchangeCode();
  }, []);

  const exchangeCode = async () => {
    if (!params.code) {
      setExchanging(false);
      return;
    }

    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    setExchanging(false);

    if (error) {
      Alert.alert(
        "Link Expired",
        "This reset link is invalid or has expired. Please request a new one.",
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
      return;
    }

    setSessionReady(true);
  };

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in both password fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password Too Short", "Use at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please re-enter your password.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (error) {
      Alert.alert("Couldn't Update Password", error.message);
      return;
    }

    Alert.alert(
      "Password Updated",
      "Your password has been changed successfully.",
      [{ text: "OK", onPress: () => router.replace("/home") }],
    );
  };

  if (exchanging) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#dc2626" size="large" />
        <Text style={styles.statusText}>Verifying your reset link...</Text>
      </SafeAreaView>
    );
  }

  if (!sessionReady) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.statusText}>
          This reset link is invalid or has expired.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>BACK TO LOG IN</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.title}>SET NEW PASSWORD</Text>
        <Text style={styles.subtitle}>
          Choose a new password for your account.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter new password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleUpdatePassword}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "SAVING..." : "UPDATE PASSWORD"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0f12",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  statusText: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  formCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1e232d",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: { width: "100%", marginBottom: 15 },
  label: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 45,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "#0f172a",
    fontSize: 14,
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
