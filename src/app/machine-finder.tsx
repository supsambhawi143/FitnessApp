import { EXERCISE_DATABASE, Exercise } from "@/app/exercises";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MachineFinderScreen() {
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  const defaultMuscle = (params.muscle as string) || "chest";

  // Helper to locate which muscle category contains the scanned exercise ID
  const findExerciseAndCategory = () => {
    if (exerciseId) {
      for (const [group, exList] of Object.entries(EXERCISE_DATABASE)) {
        const foundIdx = exList.findIndex((ex) => ex.id === exerciseId);
        if (foundIdx !== -1) {
          return { category: group, index: foundIdx };
        }
      }
    }
    return { category: defaultMuscle, index: 0 };
  };

  const initialMatch = findExerciseAndCategory();
  const [currentMuscle, setCurrentMuscle] = useState(initialMatch.category);
  const [selectedIndex, setSelectedIndex] = useState(initialMatch.index);

  const exercises =
    EXERCISE_DATABASE[currentMuscle] || EXERCISE_DATABASE.chest || [];
  const currentExercise: Exercise = exercises[selectedIndex] || exercises[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Scan QR button on top right */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Machine Finder</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("/machine-scanner" as any)}
        >
          <Text style={styles.scanButtonText}>📷 Scan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>SELECT MACHINE TO IDENTIFY</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {exercises.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chip,
                selectedIndex === idx && styles.chipSelected,
              ]}
              onPress={() => setSelectedIndex(idx)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedIndex === idx && styles.chipTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {currentExercise && (
          <View style={styles.card}>
            <View style={styles.mediaContainer}>
              <Image
                source={
                  typeof currentExercise.mediaSource === "object"
                    ? { uri: currentExercise.mediaSource.uri }
                    : currentExercise.mediaSource
                }
                style={styles.mediaPlayer}
                contentFit="cover"
              />
            </View>

            <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
            <Text style={styles.targetBadge}>
              Target: {currentExercise.target}
            </Text>

            <Text style={styles.guideHeader}>
              ⚙️ SEAT & PIN ADJUSTMENT GUIDE
            </Text>
            <View style={styles.guideBox}>
              <Text style={styles.guideText}>
                1. Look for yellow or red pull-pins under the seat or backrest.
              </Text>
              <Text style={styles.guideText}>
                2. Adjust seat height so handles line up with mid-
                {currentExercise.muscle}.
              </Text>
              <Text style={styles.guideText}>
                3. Insert weight stack pin starting at the 2nd or 3rd plate.
              </Text>
            </View>

            <Text style={styles.guideHeader}>📋 SETUP STEPS</Text>
            {(currentExercise.setupSteps || []).map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNum}>0{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f12" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e232d",
  },
  backText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  scanButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  scanButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  scrollContent: { padding: 20 },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipRow: { gap: 8, marginBottom: 20 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  chipSelected: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  chipText: { color: "#94a3b8", fontSize: 12, fontWeight: "700" },
  chipTextSelected: { color: "#ffffff" },
  card: {
    backgroundColor: "#161b22",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  mediaContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1e232d",
    marginBottom: 16,
  },
  mediaPlayer: { width: "100%", height: "100%" },
  exerciseTitle: { color: "#ffffff", fontSize: 20, fontWeight: "800" },
  targetBadge: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 16,
  },
  guideHeader: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  guideBox: {
    backgroundColor: "#1e232d",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  guideText: { color: "#cbd5e1", fontSize: 12, lineHeight: 17 },
  stepRow: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start" },
  stepNum: {
    color: "#dc2626",
    fontWeight: "800",
    marginRight: 8,
    fontSize: 12,
  },
  stepText: { color: "#ffffff", fontSize: 13, flex: 1 },
});
