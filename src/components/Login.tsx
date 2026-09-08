import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface LoginProps {
  onSwitchToSignUp: () => void;
}

export default function Login({ onSwitchToSignUp }: LoginProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log("Logging in with:", formData);
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.title}>LOG IN</Text>
      <Text style={styles.subtitle}>
        Log in to continue tracking your fitness goals.
      </Text>

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

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToSignUp} style={{ marginTop: 20 }}>
        <Text style={styles.subtitle}>
          Don't have an account? <Text style={styles.linkText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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
