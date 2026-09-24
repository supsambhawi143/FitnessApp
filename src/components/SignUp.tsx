import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

interface SignUpProps {
  onSwitchToLogin: () => void;
}

export default function SignUp({ onSwitchToLogin }: SignUpProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    weight: "", // Added state for weight
    height: "", // Added state for height
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.weight ||
      !formData.height
    ) {
      Alert.alert(
        "Error",
        "Please fill in all fields including weight and height.",
      );
      return;
    }

    setLoading(true);

    // 1. Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
      },
    });

    if (error) {
      setLoading(false);
      Alert.alert("Sign Up Failed", error.message);
      return;
    }

    // 2. Insert/Upsert weight and height into the 'profiles' table using the newly created user's ID
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
      });

      if (profileError) {
        console.error("Profile save error:", profileError.message);
      }
    }

    setLoading(false);

    Alert.alert(
      "Account Created",
      "Your account has been created successfully. Please log in to continue.",
      [{ text: "OK", onPress: () => onSwitchToLogin() }],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#64748b"
        value={formData.fullName}
        onChangeText={(text) => handleChange("fullName", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#64748b"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      {/* Inputs for Height & Weight */}
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Weight (kg)"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={formData.weight}
          onChangeText={(text) => handleChange("weight", text)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Height (cm)"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={formData.height}
          onChangeText={(text) => handleChange("height", text)}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "CREATING..." : "SIGN UP"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSwitchToLogin}
        style={styles.switchContainer}
      >
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.linkText}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0f12",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#1e232d",
    color: "#ffffff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  switchContainer: { marginTop: 20, alignItems: "center" },
  switchText: { color: "#94a3b8", fontSize: 14 },
  linkText: { color: "#dc2626", fontWeight: "bold" },
});
