import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Exercise = {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  caution?: boolean;
  mediaUrl?: string;
  mediaType?: string;
};

export default function WorkoutDayScreen() {
  const params = useLocalSearchParams<{
    dayLabel?: string;
    focus?: string;
    exercises?: string;
  }>();

  const exercises: Exercise[] = useMemo(() => {
    try {
      return params.exercises ? JSON.parse(params.exercises) : [];
    } catch {
      return [];
    }
  }, [params.exercises]);

  const [index, setIndex] = useState(0);
  const current = exercises[index];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(exercises.length - 1, i + 1));

  if (!current) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No exercises found for this day.</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.homeButtonText}>🏠 EXPLORE HOME</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>YOUR TRAINING</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressRow}>
        {exercises.map((_, i) => (
          <View
            key={i}
            style={[styles.progressBar, i <= index && styles.progressBarActive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dayFocusText}>
          {params.dayLabel} · {params.focus}
        </Text>

        <View style={styles.previewCard}>
          {current.mediaUrl ? (
            <Image
              source={{ uri: current.mediaUrl }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderEmoji}>🏋️</Text>
              <Text style={styles.previewPlaceholderText}>
                No preview available yet
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.exerciseName}>
          {current.caution ? "⚠️ " : ""}
          {current.name}
        </Text>
        <Text style={styles.exerciseDetail}>
          {current.sets > 0
            ? `${current.sets} sets x ${current.reps}`
            : current.reps}
        </Text>
        {current.caution && (
          <Text style={styles.cautionNote}>
            This may stress the area you flagged — consider a lighter load or a
            machine variation.
          </Text>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navButton, index === 0 && styles.navButtonDisabled]}
            disabled={index === 0}
            onPress={goPrev}
          >
            <Text style={styles.navButtonText}>‹ Prev</Text>
          </TouchableOpacity>
          <Text style={styles.navCount}>
            {index + 1} / {exercises.length}
          </Text>
          <TouchableOpacity
            style={[
              styles.navButton,
              index === exercises.length - 1 && styles.navButtonDisabled,
            ]}
            disabled={index === exercises.length - 1}
            onPress={goNext}
          >
            <Text style={styles.navButtonText}>Next ›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.thumbLabel}>
          {exercises.length} EXERCISES TODAY
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {exercises.map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.thumb, i === index && styles.thumbActive]}
              onPress={() => setIndex(i)}
            >
              {ex.mediaUrl ? (
                <Image
                  source={{ uri: ex.mediaUrl }}
                  style={styles.thumbImage}
                />
              ) : (
                <Text style={styles.thumbFallback}>
                  {ex.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/home")}
        >
          <Text style={styles.homeButtonText}>🏠 EXPLORE HOME</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f12" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backArrow: { color: "#ffffff", fontSize: 28, fontWeight: "300" },
  headerTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#2d3748",
  },
  progressBarActive: { backgroundColor: "#dc2626" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  dayFocusText: {
    color: "#dc2626",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 14,
  },
  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    height: 380,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  previewImage: { width: "100%", height: "100%", borderRadius: 20 },
  previewPlaceholder: { alignItems: "center" },
  previewPlaceholderEmoji: { fontSize: 40, marginBottom: 8 },
  previewPlaceholderText: { color: "#64748b", fontSize: 13 },
  exerciseName: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  exerciseDetail: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  cautionNote: {
    color: "#f87171",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 17,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 22,
  },
  navButton: {
    backgroundColor: "#1e232d",
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  navCount: { color: "#64748b", fontSize: 12, fontWeight: "700" },
  thumbLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 10,
  },
  thumbRow: { gap: 10, paddingBottom: 24 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#1e232d",
    borderWidth: 2,
    borderColor: "#2d3748",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  thumbActive: { borderColor: "#dc2626" },
  thumbImage: { width: "100%", height: "100%" },
  thumbFallback: { color: "#94a3b8", fontWeight: "800", fontSize: 18 },
  homeButton: {
    backgroundColor: "#0d0f12",
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  homeButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  emptyText: { color: "#94a3b8", textAlign: "center" },
});
