import { EXERCISE_DATABASE, Exercise } from "@/app/exercises";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActiveWorkoutScreen() {
  const params = useLocalSearchParams();

  // Safely parse selected muscles with fallback
  const selectedMuscles = ((params.muscles as string) || "chest")
    .split(",")
    .map((m) => m.trim().toLowerCase());

  // Flatten exercises safely and default to empty array if muscle key is missing
  const activeExercises: Exercise[] = selectedMuscles.flatMap(
    (m) => EXERCISE_DATABASE[m] || [],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(60);

  // Safe fallback if activeExercises is empty
  const currentExercise =
    activeExercises[currentIndex] || EXERCISE_DATABASE.chest?.[0];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (restTimeLeft === 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const saveWorkoutLog = async (muscles: string[]) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("workout_logs").insert([
      {
        user_id: user.id,
        muscles_trained: muscles,
        duration_minutes: 35,
      },
    ]);

    if (error) {
      console.error("Error logging workout:", error.message);
    }
  };

  const startRestTimer = () => {
    setRestTimeLeft(60);
    setIsResting(true);
  };

  const handleNextSet = async () => {
    if (!currentExercise) return;

    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      startRestTimer();
    } else {
      if (currentIndex < activeExercises.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentSet(1);
        startRestTimer();
      } else {
        await saveWorkoutLog(selectedMuscles);
        const musclesFormatted = selectedMuscles
          .map((m) => m.toUpperCase())
          .join(" & ");

        Alert.alert(
          "Workout Complete! 🎉",
          `Great job finishing your ${musclesFormatted} workout!`,
          [
            {
              text: "Done",
              onPress: () => router.replace("/home"),
            },
          ],
        );
      }
    }
  };

  // Guard clause to prevent rendering errors if exercise database is empty or missing key
  if (!currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#ffffff", fontSize: 16 }}>
            No exercises found for selected muscle group.
          </Text>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { marginTop: 20, paddingHorizontal: 20 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.actionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Exercise {currentIndex + 1} of {activeExercises.length}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/home")}>
          <Text style={styles.quitText}>Quit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mediaContainer}>
          <Image
            source={
              typeof currentExercise.mediaSource === "object"
                ? {
                    uri: currentExercise.mediaSource.uri,
                    headers: {
                      "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    },
                  }
                : currentExercise.mediaSource
            }
            style={styles.mediaPlayer}
            contentFit="cover"
            autoplay={true}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🟢 Form Loop</Text>
          </View>
        </View>

        <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
        <Text style={styles.exerciseSubtitle}>
          Target: {currentExercise.target} • {currentExercise.sets} Sets ×{" "}
          {currentExercise.reps} Reps
        </Text>

        {currentExercise.tip && (
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⚠️ Key Beginner Tip</Text>
            <Text style={styles.tipText}>{currentExercise.tip}</Text>
          </View>
        )}

        <Text style={styles.sectionHeader}>HOW TO PERFORM</Text>
        {(currentExercise.setupSteps || []).map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <Text style={styles.stepNumber}>0{idx + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        <Text style={styles.sectionHeader}>COMMON MISTAKES TO AVOID</Text>
        {(currentExercise.mistakes || []).map((mistake, idx) => (
          <Text key={idx} style={styles.mistakeText}>
            ❌ {mistake}
          </Text>
        ))}

        {/* Set Tracker Bar */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerText}>
            Set {currentSet} of {currentExercise.sets}
          </Text>
          <Text style={styles.targetReps}>
            Target: {currentExercise.reps} Reps
          </Text>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleNextSet}>
          <Text style={styles.actionButtonText}>
            {currentSet === currentExercise.sets &&
            currentIndex === activeExercises.length - 1
              ? "FINISH WORKOUT"
              : currentSet === currentExercise.sets
                ? "NEXT EXERCISE →"
                : "COMPLETE SET"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* REST TIMER MODAL */}
      <Modal visible={isResting} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.restCard}>
            <Text style={styles.restTitle}>REST TIME</Text>
            <Text style={styles.restTimerText}>
              00:{restTimeLeft < 10 ? `0${restTimeLeft}` : restTimeLeft}
            </Text>
            <Text style={styles.restSubtitle}>
              Catch your breath & sip water
            </Text>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setIsResting(false)}
            >
              <Text style={styles.skipButtonText}>SKIP REST</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f12" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e232d",
  },
  backText: { color: "#94a3b8", fontSize: 14 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  quitText: { color: "#dc2626", fontSize: 14, fontWeight: "700" },
  scrollContent: { padding: 20 },
  mediaContainer: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#1e232d",
  },
  mediaPlayer: { width: "100%", height: "100%" },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: { color: "#4ade80", fontSize: 11, fontWeight: "800" },
  exerciseTitle: { color: "#ffffff", fontSize: 24, fontWeight: "800" },
  exerciseSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: "#2a1215",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7f1d1d",
    marginBottom: 20,
  },
  tipTitle: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 4,
  },
  tipText: { color: "#fca5a5", fontSize: 12 },
  sectionHeader: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  stepNumber: {
    color: "#dc2626",
    fontWeight: "800",
    marginRight: 10,
    fontSize: 12,
  },
  stepText: { color: "#ffffff", fontSize: 13, flex: 1 },
  mistakeText: { color: "#cbd5e1", fontSize: 13, marginBottom: 6 },
  trackerCard: {
    backgroundColor: "#1e232d",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
  },
  trackerText: { color: "#ffffff", fontWeight: "800", fontSize: 16 },
  targetReps: { color: "#ef4444", fontWeight: "700" },
  actionButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  restCard: {
    backgroundColor: "#161b22",
    width: "100%",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  restTitle: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  restTimerText: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "900",
    marginVertical: 16,
  },
  restSubtitle: { color: "#94a3b8", fontSize: 13, marginBottom: 24 },
  skipButton: {
    backgroundColor: "#1e232d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  skipButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 13 },
});
