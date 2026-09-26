import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TOTAL_STEPS = 10;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BODY_SHAPES = [
  { id: "slim", label: "🧍 Slim" },
  { id: "average", label: "🙂 Average" },
  { id: "athletic", label: "🏃 Athletic" },
  { id: "heavy", label: "🧱 Heavy Set" },
];

const DREAM_SHAPES = [
  { id: "lean", label: "✨ Lean & Toned" },
  { id: "athletic", label: "🏃 Athletic" },
  { id: "muscular", label: "💪 Muscular & Bulky" },
  { id: "slim", label: "🧍 Slim" },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);

  // Step 1: Gender
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

  // Step 2: Age
  const [age, setAge] = useState("");

  // Step 3: Height & current weight
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightVal, setWeightVal] = useState("");

  // Step 4: Target weight
  const [targetWeightVal, setTargetWeightVal] = useState("");

  // Step 5: Body shape (current + dream)
  const [currentBodyShape, setCurrentBodyShape] = useState("");
  const [dreamBodyShape, setDreamBodyShape] = useState("");

  // Step 6: Primary goal
  const [goal, setGoal] = useState("build_muscle");

  // Step 7: Training experience
  const [trainingExperience, setTrainingExperience] = useState<
    "beginner" | "intermediate" | "advanced" | ""
  >("");

  // Step 8: Injury / pain
  const [hasInjury, setHasInjury] = useState<"yes" | "no" | "">("");
  const [injuryDetails, setInjuryDetails] = useState("");

  // Step 9: Training days
  const [trainingDays, setTrainingDays] = useState<string[]>([]);

  // Step 10: Hours per gym session
  const [hoursPerSession, setHoursPerSession] = useState("");

  const [loading, setLoading] = useState(false);

  // ---- Helper conversions ----
  const getFinalHeightCm = (): number => {
    if (heightUnit === "cm") {
      return parseInt(heightCm) || 0;
    }
    const ft = parseFloat(heightFeet) || 0;
    const inc = parseFloat(heightInches) || 0;
    return Math.round((ft * 12 + inc) * 2.54);
  };

  const toKg = (val: string, unit: "kg" | "lbs"): number => {
    const num = parseFloat(val) || 0;
    return unit === "kg" ? Math.round(num) : Math.round(num * 0.453592);
  };

  const calculateRecommendation = () => {
    if (goal === "lose_weight") {
      return "Full Body Express (3x/week) + Cardio Finishers";
    } else if (goal === "build_muscle") {
      return "Push / Pull / Legs Split (4-5x/week)";
    }
    return "Balanced Fitness & Mobility Routine (3x/week)";
  };

  const toggleDay = (day: string) => {
    setTrainingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const finalHeight = getFinalHeightCm();
      const finalWeight = toKg(weightVal, weightUnit);
      const finalTargetWeight = targetWeightVal
        ? toKg(targetWeightVal, weightUnit)
        : null;
      const plan = calculateRecommendation();

      const { error } = await supabase
        .from("profiles")
        .update({
          gender,
          age: parseInt(age) || 0,
          height_cm: finalHeight,
          weight_kg: finalWeight,
          target_weight_kg: finalTargetWeight,
          current_body_shape: currentBodyShape,
          dream_body_shape: dreamBodyShape,
          primary_goal: goal,
          training_experience: trainingExperience,
          has_injury: hasInjury === "yes",
          injury_details: hasInjury === "yes" ? injuryDetails : null,
          training_days: trainingDays,
          hours_per_session: hoursPerSession,
          recommended_plan: plan,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (!error) {
        router.replace("/workout-plan" as any);
      }
    }
    setLoading(false);
  };

  const isStep3Valid =
    heightUnit === "cm"
      ? !!heightCm && !!weightVal
      : !!heightFeet && !!weightVal;

  const canGoNext = (): boolean => {
    switch (step) {
      case 1:
        return !!gender;
      case 2:
        return !!age;
      case 3:
        return isStep3Valid;
      case 4:
        return !!targetWeightVal;
      case 5:
        return !!currentBodyShape && !!dreamBodyShape;
      case 7:
        return !!trainingExperience;
      case 8:
        return !!hasInjury && (hasInjury === "no" || !!injuryDetails);
      case 9:
        return trainingDays.length > 0;
      case 10:
        return !!hoursPerSession;
      default:
        return true;
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.progressText}>
          STEP {step} OF {TOTAL_STEPS}
        </Text>

        {/* STEP 1: GENDER */}
        {step === 1 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>What's your gender?</Text>
            {[
              { id: "male", label: "Male" },
              { id: "female", label: "Female" },
              { id: "other", label: "Other" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  gender === item.id && styles.optionSelected,
                ]}
                onPress={() => setGender(item.id as any)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: AGE */}
        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>What's your age?</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="e.g. 24"
              placeholderTextColor="#94a3b8"
              value={age}
              onChangeText={setAge}
            />
            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: HEIGHT & CURRENT WEIGHT */}
        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>Height & Current Weight</Text>

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

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              CURRENT WEIGHT
            </Text>
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
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: TARGET WEIGHT */}
        {step === 4 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>What's your target weight?</Text>
            <Text style={styles.helperText}>
              In {weightUnit === "kg" ? "kilograms" : "pounds"}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder={weightUnit === "kg" ? "e.g. 65" : "e.g. 143"}
              placeholderTextColor="#94a3b8"
              value={targetWeightVal}
              onChangeText={setTargetWeightVal}
            />
            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 5: BODY SHAPE (CURRENT + DREAM) */}
        {step === 5 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>Body Shape</Text>

            <Text style={styles.sectionLabel}>CURRENT BODY SHAPE</Text>
            <View style={styles.chipGrid}>
              {BODY_SHAPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.chip,
                    currentBodyShape === item.id && styles.chipSelected,
                  ]}
                  onPress={() => setCurrentBodyShape(item.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      currentBodyShape === item.id && styles.chipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              DREAM BODY SHAPE
            </Text>
            <View style={styles.chipGrid}>
              {DREAM_SHAPES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.chip,
                    dreamBodyShape === item.id && styles.chipSelected,
                  ]}
                  onPress={() => setDreamBodyShape(item.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      dreamBodyShape === item.id && styles.chipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 6: PRIMARY GOAL */}
        {step === 6 && (
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
            <TouchableOpacity style={styles.button} onPress={goNext}>
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 7: TRAINING EXPERIENCE */}
        {step === 7 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>
              What's your training experience?
            </Text>
            {[
              { id: "beginner", label: "🌱 Beginner (0-6 months)" },
              { id: "intermediate", label: "📈 Intermediate (6mo-2yrs)" },
              { id: "advanced", label: "🏆 Advanced (2+ years)" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  trainingExperience === item.id && styles.optionSelected,
                ]}
                onPress={() => setTrainingExperience(item.id as any)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 8: INJURY / PAIN */}
        {step === 8 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>
              Do you have any pain or injury?
            </Text>
            <View style={styles.unitToggleRow}>
              <TouchableOpacity
                style={[
                  styles.unitBadge,
                  hasInjury === "no" && styles.unitBadgeActive,
                ]}
                onPress={() => setHasInjury("no")}
              >
                <Text
                  style={[
                    styles.unitBadgeText,
                    hasInjury === "no" && styles.unitBadgeTextActive,
                  ]}
                >
                  NO
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitBadge,
                  hasInjury === "yes" && styles.unitBadgeActive,
                ]}
                onPress={() => setHasInjury("yes")}
              >
                <Text
                  style={[
                    styles.unitBadgeText,
                    hasInjury === "yes" && styles.unitBadgeTextActive,
                  ]}
                >
                  YES
                </Text>
              </TouchableOpacity>
            </View>

            {hasInjury === "yes" && (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Briefly describe (e.g. lower back pain, knee injury)"
                placeholderTextColor="#94a3b8"
                value={injuryDetails}
                onChangeText={setInjuryDetails}
                multiline
              />
            )}

            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 9: TRAINING DAYS */}
        {step === 9 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>Which days can you train?</Text>
            <Text style={styles.helperText}>Select all that apply</Text>
            <View style={styles.chipGrid}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.chip,
                    trainingDays.includes(day) && styles.chipSelected,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      trainingDays.includes(day) && styles.chipTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              disabled={!canGoNext()}
              style={[styles.button, !canGoNext() && styles.buttonDisabled]}
              onPress={goNext}
            >
              <Text style={styles.buttonText}>NEXT →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 10: HOURS PER SESSION */}
        {step === 10 && (
          <View style={styles.stepCard}>
            <Text style={styles.questionTitle}>
              How many hours per gym session?
            </Text>
            {[
              { id: "<1", label: "⏱️ Less than 1 hour" },
              { id: "1-2", label: "⏱️ 1-2 hours" },
              { id: "2+", label: "⏱️ 2+ hours" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  hoursPerSession === item.id && styles.optionSelected,
                ]}
                onPress={() => setHoursPerSession(item.id)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.button}
              onPress={handleFinish}
              disabled={loading || !canGoNext()}
            >
              <Text style={styles.buttonText}>
                {loading ? "SAVING..." : "SEE MY WORKOUT PLAN →"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cbb886",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 1,
    marginBottom: 12,
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
    marginBottom: 12,
    textAlign: "center",
  },
  helperText: {
    fontSize: 13,
    color: "#334155",
    marginBottom: 12,
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
  multilineInput: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 14,
    textAlign: "left",
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  chipSelected: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  chipText: { color: "#475569", fontWeight: "700", fontSize: 13 },
  chipTextSelected: { color: "#ffffff" },
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
