import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------- Types ----------
type Profile = {
  gender?: string;
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  target_weight_kg?: number;
  current_body_shape?: string;
  dream_body_shape?: string;
  primary_goal?: string;
  training_experience?: string;
  has_injury?: boolean;
  injury_details?: string;
  training_days?: string[];
  hours_per_session?: string;
};

type Exercise = { name: string; sets: number; reps: string; caution?: boolean };
type DayPlan = { dayLabel: string; focus: string; exercises: Exercise[] };

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------- Exercise pool, tagged by body area they stress ----------
const POOL: Record<string, { name: string; tags: string[] }[]> = {
  chest: [
    { name: "Barbell Bench Press", tags: ["shoulder"] },
    { name: "Incline Dumbbell Press", tags: ["shoulder"] },
    { name: "Machine Chest Press", tags: [] },
    { name: "Push-Ups", tags: [] },
    { name: "Cable Chest Fly", tags: ["shoulder"] },
  ],
  back: [
    { name: "Lat Pulldown", tags: [] },
    { name: "Seated Cable Row", tags: [] },
    { name: "Single-Arm Dumbbell Row", tags: [] },
    { name: "Assisted Pull-Ups", tags: ["shoulder"] },
    { name: "Back Extension", tags: ["back"] },
  ],
  legs: [
    { name: "Leg Press", tags: ["knee"] },
    { name: "Barbell Back Squat", tags: ["knee", "back"] },
    { name: "Walking Lunges", tags: ["knee"] },
    { name: "Romanian Deadlift", tags: ["back"] },
    { name: "Leg Extension", tags: ["knee"] },
    { name: "Seated Leg Curl", tags: [] },
    { name: "Glute Bridge", tags: [] },
  ],
  shoulders: [
    { name: "Machine Shoulder Press", tags: ["shoulder"] },
    { name: "Lateral Raise", tags: [] },
    { name: "Rear Delt Fly", tags: [] },
    { name: "Face Pull", tags: [] },
    { name: "Front Raise", tags: ["shoulder"] },
  ],
  arms: [
    { name: "Cable Curl", tags: [] },
    { name: "Hammer Curl", tags: [] },
    { name: "Tricep Rope Pushdown", tags: [] },
    { name: "Overhead Tricep Extension", tags: ["shoulder"] },
    { name: "Barbell Bicep Curl", tags: [] },
  ],
  abs: [
    { name: "Plank", tags: [] },
    { name: "Bicycle Crunch", tags: [] },
    { name: "Cable Crunch", tags: ["back"] },
    { name: "Hanging Leg Raise", tags: ["shoulder"] },
    { name: "Russian Twist", tags: ["back"] },
  ],
  cardio: [
    { name: "Incline Treadmill Walk", tags: [] },
    { name: "Elliptical", tags: [] },
    { name: "Stationary Bike Intervals", tags: ["knee"] },
    { name: "Rowing Machine", tags: ["back"] },
  ],
};

// ---------- Helpers ----------
function getInjuryTags(details?: string): string[] {
  if (!details) return [];
  const text = details.toLowerCase();
  const tags: string[] = [];
  if (text.includes("knee")) tags.push("knee");
  if (text.includes("back")) tags.push("back");
  if (text.includes("shoulder")) tags.push("shoulder");
  return tags;
}

function pickExercises(
  group: keyof typeof POOL,
  count: number,
  avoidTags: string[],
): Exercise[] {
  const pool = POOL[group];
  const safe = pool.filter((e) => !e.tags.some((t) => avoidTags.includes(t)));
  const risky = pool.filter((e) => e.tags.some((t) => avoidTags.includes(t)));
  const chosen = [...safe, ...risky].slice(0, count);
  return chosen.map((e) => ({
    name: e.name,
    sets: 0, // filled in by caller
    reps: "",
    caution: e.tags.some((t) => avoidTags.includes(t)),
  }));
}

function getVolume(goal: string, experience: string) {
  if (goal === "lose_weight") {
    return { sets: experience === "beginner" ? 2 : 3, reps: "12-15" };
  }
  if (goal === "build_muscle") {
    return {
      sets: experience === "beginner" ? 3 : experience === "advanced" ? 5 : 4,
      reps: "8-12",
    };
  }
  return { sets: 3, reps: "10-12" }; // stay_fit
}

function getExercisesPerDay(hoursPerSession?: string) {
  if (hoursPerSession === "<1") return 4;
  if (hoursPerSession === "2+") return 8;
  return 6; // 1-2
}

function sortDays(days: string[]): string[] {
  return [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

// Choose a split (a repeating list of "focus" labels) based on days/experience
function getSplit(numDays: number, experience: string): string[] {
  if (numDays <= 2) return ["Full Body", "Full Body"];
  if (numDays === 3) {
    return experience === "beginner"
      ? ["Full Body", "Full Body", "Full Body"]
      : ["Push", "Pull", "Legs"];
  }
  if (numDays === 4) return ["Upper", "Lower", "Upper", "Lower"];
  if (numDays === 5) return ["Push", "Pull", "Legs", "Upper", "Lower"];
  return ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Active Recovery"];
}

const FOCUS_GROUPS: Record<string, (keyof typeof POOL)[]> = {
  "Full Body": ["chest", "back", "legs", "abs"],
  Push: ["chest", "shoulders", "arms"],
  Pull: ["back", "arms"],
  Legs: ["legs", "abs"],
  Upper: ["chest", "back", "shoulders", "arms"],
  Lower: ["legs", "abs"],
  "Active Recovery": ["cardio", "abs"],
};

function buildPlan(profile: Profile): {
  splitName: string;
  days: DayPlan[];
  cardioNote: string;
} {
  const days = sortDays(profile.training_days || []);
  const experience = profile.training_experience || "beginner";
  const goal = profile.primary_goal || "stay_fit";
  const avoidTags = getInjuryTags(profile.injury_details);
  const exercisesPerDay = getExercisesPerDay(profile.hours_per_session);
  const { sets, reps } = getVolume(goal, experience);

  const focusSequence = getSplit(days.length || 1, experience);

  const dayPlans: DayPlan[] = (days.length ? days : ["Mon"]).map(
    (dayLabel, i) => {
      const focus = focusSequence[i % focusSequence.length];
      const groups = FOCUS_GROUPS[focus] || ["chest", "back", "legs"];
      const perGroup = Math.max(1, Math.round(exercisesPerDay / groups.length));

      let exercises: Exercise[] = [];
      groups.forEach((g) => {
        exercises = exercises.concat(pickExercises(g, perGroup, avoidTags));
      });
      exercises = exercises.slice(0, exercisesPerDay).map((e) => ({
        ...e,
        sets,
        reps: focus === "Active Recovery" ? "15-20 min" : reps,
      }));

      return { dayLabel, focus, exercises };
    },
  );

  const splitName =
    days.length <= 2
      ? "Full Body Routine"
      : days.length === 3
        ? experience === "beginner"
          ? "3-Day Full Body Split"
          : "Push / Pull / Legs"
        : days.length === 4
          ? "Upper / Lower Split"
          : "Push / Pull / Legs + Upper / Lower";

  const cardioNote =
    goal === "lose_weight"
      ? "Add 15-20 min of steady-state cardio after each session to boost the calorie deficit."
      : goal === "build_muscle"
        ? "Keep cardio light (1-2x/week) so it doesn't eat into recovery for muscle growth."
        : "2-3 light cardio sessions a week will help keep things balanced.";

  return { splitName, days: dayPlans, cardioNote };
}

// ---------- Screen ----------
export default function WorkoutPlanScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select(
          "gender, age, height_cm, weight_kg, target_weight_kg, current_body_shape, dream_body_shape, primary_goal, training_experience, has_injury, injury_details, training_days, hours_per_session",
        )
        .eq("id", user.id)
        .single();

      if (data) setProfile(data as Profile);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color="#dc2626" size="large" />
        <Text style={styles.loadingText}>Building your plan...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          We couldn't find your profile. Please complete onboarding again.
        </Text>
      </SafeAreaView>
    );
  }

  const { splitName, days, cardioNote } = buildPlan(profile);
  const weightDiff =
    profile.target_weight_kg && profile.weight_kg
      ? profile.target_weight_kg - profile.weight_kg
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>YOUR PLAN IS READY</Text>
        <Text style={styles.title}>{splitName}</Text>

        {weightDiff !== null && (
          <Text style={styles.subtitle}>
            {weightDiff === 0
              ? "Goal: maintain your current weight"
              : weightDiff < 0
                ? `Goal: lose ${Math.abs(weightDiff)} kg`
                : `Goal: gain ${weightDiff} kg`}
          </Text>
        )}

        {profile.has_injury && (
          <View style={styles.cautionBanner}>
            <Text style={styles.cautionTitle}>
              ⚠️ Training around an injury
            </Text>
            <Text style={styles.cautionText}>
              You mentioned: "{profile.injury_details}". Exercises marked ⚠️
              below may stress that area — swap them for a machine variation or
              lighter load, and check with a professional if pain persists.
            </Text>
          </View>
        )}

        {days.map((day, idx) => (
          <View key={idx} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              <Text style={styles.dayFocus}>{day.focus}</Text>
            </View>
            {day.exercises.map((ex, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>
                  {ex.caution ? "⚠️ " : ""}
                  {ex.name}
                </Text>
                <Text style={styles.exerciseDetail}>
                  {ex.sets > 0 ? `${ex.sets} x ${ex.reps}` : ex.reps}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>CARDIO NOTE</Text>
          <Text style={styles.noteText}>{cardioNote}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.buttonText}>START TRAINING →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f12" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0d0f12",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { color: "#94a3b8", marginTop: 12, textAlign: "center" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  eyebrow: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: { color: "#ffffff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#94a3b8", fontSize: 14, marginTop: 6, marginBottom: 20 },
  cautionBanner: {
    backgroundColor: "rgba(220,38,38,0.12)",
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  cautionTitle: { color: "#f87171", fontWeight: "800", marginBottom: 6 },
  cautionText: { color: "#e2e8f0", fontSize: 12, lineHeight: 18 },
  dayCard: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2d3748",
    padding: 16,
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2d3748",
    paddingBottom: 8,
  },
  dayLabel: { color: "#ffffff", fontWeight: "800", fontSize: 15 },
  dayFocus: { color: "#dc2626", fontWeight: "800", fontSize: 12 },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  exerciseName: { color: "#e2e8f0", fontSize: 13, flex: 1, paddingRight: 8 },
  exerciseDetail: { color: "#94a3b8", fontSize: 13, fontWeight: "700" },
  noteCard: {
    backgroundColor: "#1e232d",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  noteTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  noteText: { color: "#cbd5e1", fontSize: 12, lineHeight: 18 },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },
});
