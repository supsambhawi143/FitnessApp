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

type PoolItem = {
  id?: string;
  name: string;
  media_url?: string;
  media_type?: string;
};

type Exercise = {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  caution?: boolean;
  mediaUrl?: string;
  mediaType?: string;
};

type DayPlan = { dayLabel: string; focus: string; exercises: Exercise[] };

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------- Fallback pool (used if the exercises table has no matches) ----------
const FALLBACK_POOL: Record<string, PoolItem[]> = {
  chest: [
    { name: "Barbell Bench Press" },
    { name: "Incline Dumbbell Press" },
    { name: "Machine Chest Press" },
    { name: "Push-Ups" },
    { name: "Cable Chest Fly" },
  ],
  back: [
    { name: "Lat Pulldown" },
    { name: "Seated Cable Row" },
    { name: "Single-Arm Dumbbell Row" },
    { name: "Assisted Pull-Ups" },
    { name: "Back Extension" },
  ],
  legs: [
    { name: "Leg Press" },
    { name: "Barbell Back Squat" },
    { name: "Walking Lunges" },
    { name: "Romanian Deadlift" },
    { name: "Leg Extension" },
    { name: "Seated Leg Curl" },
    { name: "Glute Bridge" },
  ],
  shoulders: [
    { name: "Machine Shoulder Press" },
    { name: "Lateral Raise" },
    { name: "Rear Delt Fly" },
    { name: "Face Pull" },
    { name: "Front Raise" },
  ],
  arms: [
    { name: "Cable Curl" },
    { name: "Hammer Curl" },
    { name: "Tricep Rope Pushdown" },
    { name: "Overhead Tricep Extension" },
    { name: "Barbell Bicep Curl" },
  ],
  abs: [
    { name: "Plank" },
    { name: "Bicycle Crunch" },
    { name: "Cable Crunch" },
    { name: "Hanging Leg Raise" },
    { name: "Russian Twist" },
  ],
  cardio: [
    { name: "Incline Treadmill Walk" },
    { name: "Elliptical" },
    { name: "Stationary Bike Intervals" },
    { name: "Rowing Machine" },
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

// Heuristic: guess which body area an exercise stresses from its name,
// so injury avoidance works whether the exercise came from the DB or the
// static fallback pool.
function computeTags(name: string): string[] {
  const n = name.toLowerCase();
  const tags: string[] = [];
  if (/squat|lunge|leg press|leg extension/.test(n)) tags.push("knee");
  if (/deadlift|back extension|good morning/.test(n)) tags.push("back");
  if (/overhead|shoulder press|push press|military press|pull-?up|dip/.test(n))
    tags.push("shoulder");
  return tags;
}

function pickExercises(
  pool: PoolItem[],
  count: number,
  avoidTags: string[],
): Exercise[] {
  const withTags = pool.map((e) => ({ ...e, tags: computeTags(e.name) }));
  const safe = withTags.filter(
    (e) => !e.tags.some((t) => avoidTags.includes(t)),
  );
  const risky = withTags.filter((e) =>
    e.tags.some((t) => avoidTags.includes(t)),
  );
  const chosen = [...safe, ...risky].slice(0, count);
  return chosen.map((e) => ({
    id: e.id,
    name: e.name,
    sets: 0,
    reps: "",
    caution: e.tags.some((t) => avoidTags.includes(t)),
    mediaUrl: e.media_url,
    mediaType: e.media_type,
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
  return { sets: 3, reps: "10-12" };
}

function getExercisesPerDay(hoursPerSession?: string) {
  if (hoursPerSession === "<1") return 4;
  if (hoursPerSession === "2+") return 8;
  return 6;
}

function sortDays(days: string[]): string[] {
  return [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

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

const FOCUS_GROUPS: Record<string, string[]> = {
  "Full Body": ["chest", "back", "legs", "abs"],
  Push: ["chest", "shoulders", "arms"],
  Pull: ["back", "arms"],
  Legs: ["legs", "abs"],
  Upper: ["chest", "back", "shoulders", "arms"],
  Lower: ["legs", "abs"],
  "Active Recovery": ["cardio", "abs"],
};

function buildPlan(
  profile: Profile,
  exercisesByGroup: Record<string, PoolItem[]>,
): { splitName: string; days: DayPlan[]; cardioNote: string } {
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
        const pool = exercisesByGroup[g]?.length
          ? exercisesByGroup[g]
          : FALLBACK_POOL[g] || [];
        exercises = exercises.concat(pickExercises(pool, perGroup, avoidTags));
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
  const [plan, setPlan] = useState<{
    splitName: string;
    days: DayPlan[];
    cardioNote: string;
  } | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: profileData }, { data: exerciseRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "gender, age, height_cm, weight_kg, target_weight_kg, current_body_shape, dream_body_shape, primary_goal, training_experience, has_injury, injury_details, training_days, hours_per_session",
        )
        .eq("id", user.id)
        .single(),
      supabase
        .from("exercises")
        .select("id, name, muscle_group, media_url, media_type"),
    ]);

    const exercisesByGroup: Record<string, PoolItem[]> = {};
    (exerciseRows || []).forEach((row: any) => {
      const key = (row.muscle_group || "").toLowerCase().trim();
      if (!exercisesByGroup[key]) exercisesByGroup[key] = [];
      exercisesByGroup[key].push({
        id: row.id,
        name: row.name,
        media_url: row.media_url,
        media_type: row.media_type,
      });
    });

    if (profileData) {
      setPlan(buildPlan(profileData as Profile, exercisesByGroup));
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

  if (!plan) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          We couldn't find your profile. Please complete onboarding again.
        </Text>
      </SafeAreaView>
    );
  }

  const openDay = (day: DayPlan) => {
    router.push({
      pathname: "/workout-day" as any,
      params: {
        dayLabel: day.dayLabel,
        focus: day.focus,
        exercises: JSON.stringify(day.exercises),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.eyebrow}>YOUR PLAN IS READY</Text>
            <Text style={styles.title}>{plan.splitName}</Text>
          </View>
          <TouchableOpacity
            style={styles.homePill}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.homePillText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>Tap a day to see its exercises</Text>

        {plan.days.map((day, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.dayCard}
            activeOpacity={0.7}
            onPress={() => openDay(day)}
          >
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              <Text style={styles.dayFocus}>{day.focus}</Text>
            </View>
            <Text style={styles.dayPreview} numberOfLines={1}>
              {day.exercises.map((e) => e.name).join(" • ")}
            </Text>
            <Text style={styles.dayArrow}>View exercises →</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>CARDIO NOTE</Text>
          <Text style={styles.noteText}>{plan.cardioNote}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.buttonText}>EXPLORE HOME →</Text>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eyebrow: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
  homePill: {
    backgroundColor: "#1e232d",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  homePillText: { color: "#ffffff", fontWeight: "700", fontSize: 12 },
  helperText: { color: "#64748b", fontSize: 12, marginBottom: 18 },
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
    marginBottom: 8,
  },
  dayLabel: { color: "#ffffff", fontWeight: "800", fontSize: 15 },
  dayFocus: { color: "#dc2626", fontWeight: "800", fontSize: 12 },
  dayPreview: { color: "#94a3b8", fontSize: 12, marginBottom: 10 },
  dayArrow: { color: "#f87171", fontSize: 12, fontWeight: "700" },
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
