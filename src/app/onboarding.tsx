import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");

  // Height state
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");

  // Weight state
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightVal, setWeightVal] = useState("");

  // Goal & Activity
  const [goal, setGoal] = useState("build_muscle");
  const [activity, setActivity] = useState("moderate");
  const [loading, setLoading] = useState(false);

  // Helper conversions
  const getFinalHeightCm = (): number => {
    if (heightUnit === "cm") {
      return parseInt(heightCm) || 0;
    }
    const ft = parseFloat(heightFeet) || 0;
    const inc = parseFloat(heightInches) || 0;
    return Math.round((ft * 12 + inc) * 2.54);
  };

  const getFinalWeightKg = (): number => {
    const val = parseFloat(weightVal) || 0;
    if (weightUnit === "kg") {
      return Math.round(val);
    }
    return Math.round(val * 0.453592); // lbs to kg
  };

  const calculateRecommendation = () => {
    if (goal === "lose_weight") {
      return "Full Body Express (3x/week) + Cardio Finishers";
    } else if (goal === "build_muscle") {
      return "Push / Pull / Legs Split (4-5x/week)";
    }
    return "Balanced Fitness & Mobility Routine (3x/week)";
  };

  const handleFinish = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const finalHeight = getFinalHeightCm();
      const finalWeight = getFinalWeightKg();
      const plan = calculateRecommendation();

      const { error } = await supabase
        .from("profiles")
        .update({
          age: parseInt(age) || 0,
          height_cm: finalHeight,
          weight_kg: finalWeight,
          primary_goal: goal,
          activity_level: activity,
          recommended_plan: plan,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (!error) {
        router.replace("/");
      }
    }
    setLoading(false);
  };

  const isStep2Valid =
    heightUnit === "cm"
      ? !!heightCm && !!weightVal
      : !!heightFeet && !!weightVal;

  return (
    <SafeAreaView style={styles.container}>
      {/* STEP 1: AGE */}
      {step === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.questionTitle}>What’s your age?</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="e.g. 24"
            placeholderTextColor="#94a3b8"
            value={age}
            onChangeText={setAge}
          />
          <TouchableOpacity
            disabled={!age}
            style={[styles.button, !age && styles.buttonDisabled]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>NEXT →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: HEIGHT & WEIGHT WITH UNIT TOGGLES */}
      {step === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.questionTitle}>Height & Weight</Text>

          {/* HEIGHT SECTION */}
          <Text style={styles.sectionLabel}>HEIGHT</Text>
          <View style={styles.unitToggleRow}>
            <TouchableOpacity
              style={[
                styles.unitBadge,
                heightUnit === "cm" && styles.unitBadgeActive,
              ]}
              onPress={() => setHeightUnit("cm")}
            >
              <Text
                style={[
                  styles.unitBadgeText,
                  heightUnit === "cm" && styles.unitBadgeTextActive,
                ]}
              >
                CM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitBadge,
                heightUnit === "ft" && styles.unitBadgeActive,
              ]}
              onPress={() => setHeightUnit("ft")}
            >
              <Text
                style={[
                  styles.unitBadgeText,
                  heightUnit === "ft" && styles.unitBadgeTextActive,
                ]}
              >
                FT / IN
              </Text>
            </TouchableOpacity>
          </View>

          {heightUnit === "cm" ? (
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="Height in cm (e.g. 175)"
              placeholderTextColor="#94a3b8"
              value={heightCm}
              onChangeText={setHeightCm}
            />
          ) : (
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                keyboardType="number-pad"
                placeholder="Feet (e.g. 5)"
                placeholderTextColor="#94a3b8"
                value={heightFeet}
                onChangeText={setHeightFeet}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                keyboardType="number-pad"
                placeholder="Inches (e.g. 9)"
                placeholderTextColor="#94a3b8"
                value={heightInches}
                onChangeText={setHeightInches}
              />
            </View>
          )}

          {/* WEIGHT SECTION */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>WEIGHT</Text>
          <View style={styles.unitToggleRow}>
            <TouchableOpacity
              style={[
                styles.unitBadge,
                weightUnit === "kg" && styles.unitBadgeActive,
              ]}
              onPress={() => setWeightUnit("kg")}
            >
              <Text
                style={[
                  styles.unitBadgeText,
                  weightUnit === "kg" && styles.unitBadgeTextActive,
                ]}
              >
                KG
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unitBadge,
                weightUnit === "lbs" && styles.unitBadgeActive,
              ]}
              onPress={() => setWeightUnit("lbs")}
            >
              <Text
                style={[
                  styles.unitBadgeText,
                  weightUnit === "lbs" && styles.unitBadgeTextActive,
                ]}
              >
                LBS
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder={
              weightUnit === "kg"
                ? "Weight in kg (e.g. 70)"
                : "Weight in lbs (e.g. 154)"
            }
            placeholderTextColor="#94a3b8"
            value={weightVal}
            onChangeText={setWeightVal}
          />

          <TouchableOpacity
            disabled={!isStep2Valid}
            style={[styles.button, !isStep2Valid && styles.buttonDisabled]}
            onPress={() => setStep(3)}
          >
            <Text style={styles.buttonText}>NEXT →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: PRIMARY GOAL */}
      {step === 3 && (
        <View style={styles.stepCard}>
          <Text style={styles.questionTitle}>What is your primary goal?</Text>
          {[
            { id: "build_muscle", label: "💪 Build Muscle & Strength" },
            { id: "lose_weight", label: "🔥 Lose Weight & Fat" },
            { id: "stay_fit", label: "🏃 Stay Active & Healthy" },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                goal === item.id && styles.optionSelected,
              ]}
              onPress={() => setGoal(item.id)}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
            <Text style={styles.buttonText}>NEXT →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 4: ACTIVITY LEVEL */}
      {step === 4 && (
        <View style={styles.stepCard}>
          <Text style={styles.questionTitle}>How active are you weekly?</Text>
          {[
            { id: "sedentary", label: "🛋️ Low Activity (Office Job / Desk)" },
            { id: "moderate", label: "🚶 Moderate (1-2 Workouts / Week)" },
            { id: "active", label: "⚡ Highly Active (3+ Workouts / Week)" },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.optionCard,
                activity === item.id && styles.optionSelected,
              ]}
              onPress={() => setActivity(item.id)}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.button}
            onPress={handleFinish}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "SAVING..." : "SEE MY WORKOUT PLAN →"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cbb886",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stepCard: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  unitToggleRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
    gap: 8,
  },
  unitBadge: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  unitBadgeActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  unitBadgeTextActive: {
    color: "#ffffff",
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#000000",
    textAlign: "center",
  },
  rowInputs: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  optionCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  optionSelected: {
    borderColor: "#dc2626",
    borderWidth: 2,
    backgroundColor: "#fef2f2",
  },
  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#0f172a",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
});
