import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Day0IntroScreen() {
  const faqList = [
    {
      id: "01",
      question: "What is a Set and a Rep?",
      answer:
        "A Rep (Repetition) is completing one full movement once (e.g., lifting and lowering a weight 1 time). A Set is a group of reps completed in a row without stopping (e.g., doing 10 reps, resting, then doing 10 more = 2 sets).",
    },
    {
      id: "02",
      question: "How heavy should I start lifting?",
      answer:
        "Pick a weight where the last 2-3 reps feel challenging, but your form stays completely clean. If you are struggling or swinging your body on rep 1, the weight is too heavy.",
    },
    {
      id: "03",
      question: "How long should I rest between sets?",
      answer:
        "Rest 60 to 90 seconds for standard machine and dumbbell exercises. This lets your energy recover so you can complete the next set safely.",
    },
    {
      id: "04",
      question: "What if someone is using the machine I need?",
      answer:
        "Don't worry! You can ask 'How many sets do you have left?' or do a free-weight alternative (like dumbbells) instead. The app provides alternative exercises for every movement.",
    },
    {
      id: "05",
      question: "Should I do cardio before or after weights?",
      answer:
        "Do 5 minutes of light cardio (like walking) as a quick warm-up. Save your intense cardio for after weightlifting so your muscles aren't exhausted during your main workout.",
    },
    {
      id: "06",
      question: "How often should I go to the gym?",
      answer:
        "For a complete beginner, 3 days a week with rest days in between is optimal. Your muscles grow and adapt while resting, not while lifting.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day 0: Gym Essentials</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.badge}>BEGINNER FAQ GUIDE</Text>
        <Text style={styles.title}>First Day at the Gym?</Text>
        <Text style={styles.subtitle}>
          Walking into a gym for the first time can feel intimidating. Here are
          answers to the most common questions before you touch a weight:
        </Text>

        {/* FAQ Cards */}
        {faqList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.stepNumber}>{item.id}.</Text>
              <Text style={styles.stepTitle}>{item.question}</Text>
            </View>
            <Text style={styles.stepDesc}>{item.answer}</Text>
          </View>
        ))}

        {/* Call to Action */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            router.push({
              pathname: "/active-workout" as any,
              params: { muscles: "chest,triceps" },
            })
          }
        >
          <Text style={styles.startButtonText}>START YOUR FIRST WORKOUT →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0f12",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e232d",
  },
  backText: {
    color: "#94a3b8",
    fontSize: 14,
    marginRight: 16,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
  },
  badge: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#1e232d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stepNumber: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 8,
  },
  stepTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    lineHeight: 20,
  },
  stepDesc: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 19,
  },
  startButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  startButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
