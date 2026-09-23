import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>WELCOME BACK,</Text>
            <Text style={styles.userName}>Alex Johnson</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AJ</Text>
          </View>
        </View>

        {/* Hero Card / Quick Start */}
        <ImageBackground
          source={require("../../assets/images/GymFrontBg.jpg")}
          style={styles.heroCard}
          imageStyle={{ borderRadius: 16, opacity: 0.5 }}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTag}>TODAY'S WORKOUT</Text>
            <Text style={styles.heroTitle}>Heavy Chest & Triceps</Text>
            <Text style={styles.heroSubtitle}>45 Mins • High Intensity</Text>

            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>START WORKOUT</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Daily Stats Grid */}
        <Text style={styles.sectionTitle}>DAILY PROGRESS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>650 / 800</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Workout Time</Text>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statUnit}>mins</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>8,420</Text>
            <Text style={styles.statUnit}>steps</Text>
          </View>
        </View>

        {/* Workout Categories */}
        <Text style={styles.sectionTitle}>EXPLORE PROGRAMS</Text>
        <View style={styles.categoryList}>
          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>Strength Training</Text>
            <Text style={styles.categorySub}>Hypertrophy & Power</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>HIIT & Cardio</Text>
            <Text style={styles.categorySub}>Fat Loss & Stamina</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>Mobility & Core</Text>
            <Text style={styles.categorySub}>Flexibility & Balance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0f12",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
  },
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
  avatarText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  heroCard: {
    height: 200,
    backgroundColor: "#000",
    borderRadius: 16,
    marginBottom: 28,
    overflow: "hidden",
  },
  heroOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  heroTag: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  startButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e232d",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  statUnit: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: "#1e232d",
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
  },
  categoryTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  categorySub: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
});
