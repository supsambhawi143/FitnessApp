import { EXERCISE_DATABASE } from "@/app/exercises";
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

export default function SwapExerciseScreen() {
  const params = useLocalSearchParams();
  const muscleKey = (params.muscle as string) || "chest";
  const exercises =
    EXERCISE_DATABASE[muscleKey] || EXERCISE_DATABASE.chest || [];

  const [selectedMainIndex, setSelectedMainIndex] = useState(0);
  const selectedExercise = exercises[selectedMainIndex] || exercises[0];

  // Filter alternative exercises excluding the main selected exercise
  const alternatives = exercises.filter((_, idx) => idx !== selectedMainIndex);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Swap Exercise</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>BUSY MACHINE / EXERCISE</Text>

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
                selectedMainIndex === idx && styles.chipSelected,
              ]}
              onPress={() => setSelectedMainIndex(idx)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedMainIndex === idx && styles.chipTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          AVAILABLE SWAPS FOR {muscleKey.toUpperCase()}
        </Text>

        {alternatives.map((alt) => (
          <View key={alt.id} style={styles.altCard}>
            <View style={styles.altHeader}>
              <View style={styles.altImageContainer}>
                <Image
                  source={
                    typeof alt.mediaSource === "object"
                      ? { uri: alt.mediaSource.uri }
                      : alt.mediaSource
                  }
                  style={styles.altImage}
                  contentFit="cover"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.altTitle}>{alt.name}</Text>
                <Text style={styles.altTarget}>Target: {alt.target}</Text>
                <Text style={styles.altReps}>
                  {alt.sets} Sets × {alt.reps} Reps
                </Text>
              </View>
            </View>

            {alt.tip && (
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>💡 {alt.tip}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.swapButton}
              onPress={() =>
                router.replace({
                  pathname: "/active-workout" as any,
                  params: { muscles: muscleKey },
                })
              }
            >
              <Text style={styles.swapButtonText}>USE THIS SWAP →</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  altCard: {
    backgroundColor: "#161b22",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2d3748",
  },
  altHeader: { flexDirection: "row", alignItems: "center" },
  altImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1e232d",
  },
  altImage: { width: "100%", height: "100%" },
  altTitle: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  altTarget: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  altReps: { color: "#dc2626", fontSize: 12, fontWeight: "700", marginTop: 2 },
  tipBox: {
    backgroundColor: "#1e232d",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  tipText: { color: "#cbd5e1", fontSize: 11 },
  swapButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  swapButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 12 },
});
