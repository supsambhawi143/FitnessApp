import { supabase } from "@/lib/supabase"; // Adjust path if your lib folder is elsewhere
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- FORGOT PASSWORD FLOW ---
  const handleForgotPassword = async () => {
    if (!formData.email) {
      Alert.alert(
        "Enter Your Email",
        "Please type your email address above, then tap 'Forgot password?' again.",
      );
      return;
    }

    setLoading(true);
    // Builds the right scheme automatically: exp://... in Expo Go during
    // dev, yourapp://... in a standalone/production build. This URL must
    // also be added to Supabase → Authentication → URL Configuration →
    // Redirect URLs, or Supabase will silently fall back to the project's
    // default Site URL (often localhost) instead.
    const redirectTo = Linking.createURL("reset-password");
    console.log("Redirect URL:", redirectTo); // TEMP: check this matches your Supabase Redirect URLs allow list, then remove

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      { redirectTo },
    );
    setLoading(false);

    if (error) {
      Alert.alert("Reset Failed", error.message);
    } else {
      Alert.alert(
        "Check Your Email",
        "If an account exists for that email, we've sent a password reset link.",
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    if (isLogin) {
      // --- LOG IN FLOW ---
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      setLoading(false);

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        router.replace("/home"); // Redirects to Home Screen on successful login
      }
    } else {
      // --- SIGN UP FLOW ---
      if (!formData.fullName) {
        setLoading(false);
        Alert.alert("Missing Field", "Please enter your full name.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      setLoading(false);

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      // Supabase does NOT return an error when the email is already
      // registered — it silently returns a user object with an empty
      // `identities` array instead (this is intentional, to stop the
      // signup form being used to enumerate existing accounts). We have
      // to check for that ourselves to know it wasn't a real signup.
      const emailAlreadyRegistered =
        data?.user && data.user.identities && data.user.identities.length === 0;

      if (emailAlreadyRegistered) {
        Alert.alert(
          "Email Already Registered",
          "An account with this email already exists. If this is you, log in below — or reset your password if you forgot it.",
          [
            { text: "Log In", onPress: () => setIsLogin(true) },
            { text: "Reset Password", onPress: handleForgotPassword },
            { text: "Cancel", style: "cancel" },
          ],
          { cancelable: true },
        );
        return;
      }

      Alert.alert(
        "Account Created",
        "Your account has been created successfully. Please log in to continue.",
        [
          {
            text: "OK",
            onPress: () => setIsLogin(true), // Switches view to Login screen
          },
        ],
        { cancelable: false },
      );
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/GymFrontBg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.title}>{isLogin ? "LOG IN" : "SIGN UP"}</Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Log in to continue tracking your fitness goals."
              : "Create your account to start tracking progress."}
          </Text>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
                value={formData.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange("password", text)}
            />
          </View>

          {isLogin && (
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "PLEASE WAIT..."
                : isLogin
                  ? "Log In"
                  : "Create Account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={{ marginTop: 20 }}
          >
            <Text style={styles.subtitle}>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <Text style={styles.linkText}>
                {isLogin ? "Sign Up" : "Log In"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  formCard: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "rgba(30, 35, 45, 0.9)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#dc2626",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginBottom: 10,
    marginTop: -6,
  },
  forgotPasswordText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "700",
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  linkText: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});
