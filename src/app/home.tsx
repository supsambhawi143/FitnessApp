import { MUSCLE_GROUPS } from "@/app/exercises";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Fallback list in case MUSCLE_GROUPS is not exported properly from exercises.ts
const DEFAULT_MUSCLE_GROUPS = [
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "legs", label: "Legs" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "abs", label: "Abs" },
];

export default function HomeScreen() {
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [isNewUser, setIsNewUser] = useState(true);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(["chest"]);

  // Safely fallback to DEFAULT_MUSCLE_GROUPS if import is undefined
  const muscleGroups = MUSCLE_GROUPS || DEFAULT_MUSCLE_GROUPS;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(fullName);
      setUserInitials(
        fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      );

      // Check account age: New user if created within 24 hours
      const createdAt = new Date(user.created_at).getTime();
      const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
      setIsNewUser(hoursSinceCreation <= 24);
    }
  };

  const toggleMuscle = (id: string) => {
    if (selectedMuscles.includes(id)) {
      if (selectedMuscles.length > 1) {
        setSelectedMuscles(selectedMuscles.filter((m) => m !== id));
      }
    } else {
      setSelectedMuscles([...selectedMuscles, id]);
    }
  };

  const handleStartWorkout = () => {
    router.push({
      pathname: "/active-workout" as any,
      params: { muscles: selectedMuscles.join(",") },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {isNewUser ? "WELCOME," : "WELCOME BACK,"}
            </Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
        </View>

        {/* 1. DAY 0 / BEGINNER ESSENTIALS BANNER */}
        <TouchableOpacity
          style={styles.day0Card}
          onPress={() => router.push("/day0-intro" as any)}
        >
          <View style={styles.day0Badge}>
            <Text style={styles.day0BadgeText}>FIRST TIME AT GYM?</Text>
          </View>
          <Text style={styles.day0Title}>Day 0: Survival & FAQ Guide</Text>
          <Text style={styles.day0Subtitle}>
            Learn sets/reps, machine setup, weight selection & etiquette →
          </Text>
        </TouchableOpacity>

        {/* 2. DYNAMIC WORKOUT BUILDER */}
        <Text style={styles.sectionTitle}>WHAT ARE WE TRAINING TODAY?</Text>
        <View style={styles.selectorCard}>
          <Text style={styles.selectorSub}>
            Tap one or combine muscles (e.g. Chest + Triceps):
          </Text>
          <View style={styles.chipGrid}>
            {(muscleGroups || []).map((group) => {
              const isSelected = selectedMuscles.includes(group.id);
              return (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleMuscle(group.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {group.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
          >
            <Text style={styles.startButtonText}>
              START {selectedMuscles.join(" + ").toUpperCase()} WORKOUT →
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. QUICK BEGINNER PRESETS */}
        <Text style={styles.sectionTitle}>RECOMMENDED BEGINNER PLANS</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              router.push({
                pathname: "/active-workout" as any,
                params: { muscles: "chest,back,legs" },
              })
            }
          >
            <Text style={styles.presetTag}>30 MINS</Text>
            <Text style={styles.presetTitle}>Full Body Express</Text>
            <Text style={styles.presetSub}>
              Chest, Back & Legs machine basics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetCard}
            onPress={() =>
              router.push({
                pathname: "/active-workout" as any,
                params: { muscles: "chest,shoulders,triceps" },
              })
            }
          >
            <Text style={styles.presetTag}>35 MINS</Text>
            <Text style={styles.presetTitle}>Push Day (Upper)</Text>
            <Text style={styles.presetSub}>Chest, Shoulders & Triceps</Text>
          </TouchableOpacity>
        </View>

        {/* 4. GYM SURVIVAL TOOLKIT */}
        <Text style={styles.sectionTitle}>GYM TOOLKIT</Text>
        <View style={styles.toolkitGrid}>
          <View style={styles.toolCard}>
            <Text style={styles.toolIcon}>🔍</Text>
            <Text style={styles.toolTitle}>Machine Finder</Text>
            <Text style={styles.toolSub}>
              How to recognize & adjust machines
            </Text>
          </View>

          <View style={styles.toolCard}>
            <Text style={styles.toolIcon}>🔄</Text>
            <Text style={styles.toolTitle}>Swap Exercise</Text>
            <Text style={styles.toolSub}>If machine is taken or busy</Text>
          </View>
        </View>

        {/* 5. WEEKLY CONSISTENCY TRACKER */}
        <Text style={styles.sectionTitle}>THIS WEEK'S GOAL</Text>
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <Text style={styles.trackerTitle}>Target: 3 Workouts / Week</Text>
            <Text style={styles.trackerStreak}>🔥 1 Completed</Text>
          </View>
          <View style={styles.daysRow}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <View key={day} style={styles.dayColumn}>
                <View
                  style={[
                    styles.dayDot,
                    i === 0 && styles.dayDotCompleted,
                    i === 2 && styles.dayDotToday,
                  ]}
                />
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f12" },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  userName: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e232d",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  avatarText: { color: "#ffffff", fontWeight: "bold" },
  day0Card: {
    backgroundColor: "#1e232d",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  day0Badge: {
    backgroundColor: "rgba(220,38,38,0.2)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  day0BadgeText: {
    color: "#dc2626",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  day0Title: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  day0Subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  selectorCard: {
    backgroundColor: "#161b22",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  selectorSub: { color: "#cbd5e1", fontSize: 13, marginBottom: 14 },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#1e232d",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipSelected: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  chipText: { color: "#94a3b8", fontWeight: "700", fontSize: 13 },
  chipTextSelected: { color: "#ffffff" },
  startButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  startButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  presetRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  presetCard: {
    flex: 1,
    backgroundColor: "#1e232d",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  presetTag: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
  },
  presetTitle: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  presetSub: { color: "#64748b", fontSize: 11, marginTop: 4, lineHeight: 15 },
  toolkitGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  toolCard: {
    flex: 1,
    backgroundColor: "#161b22",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  toolIcon: { fontSize: 20, marginBottom: 6 },
  toolTitle: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  toolSub: { color: "#64748b", fontSize: 10, marginTop: 2, lineHeight: 14 },
  trackerCard: {
    backgroundColor: "#1e232d",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  trackerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  trackerTitle: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  trackerStreak: { color: "#ef4444", fontWeight: "800", fontSize: 12 },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayColumn: { alignItems: "center" },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0d0f12",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  dayDotCompleted: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  dayDotToday: { borderColor: "#ef4444", borderWidth: 2 },
  dayText: { color: "#64748b", fontSize: 11, fontWeight: "600" },
});
