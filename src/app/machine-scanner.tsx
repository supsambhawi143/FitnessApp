import { EXERCISE_DATABASE, Exercise } from "@/app/exercises";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MachineScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.text}>
          Camera permission is required to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const allExercises: Exercise[] = Object.values(EXERCISE_DATABASE).flat();

  const resetScanner = () => {
    setScanned(false);
    setIsAnalyzing(false);
  };

  const navigateToMachine = (exerciseId: string) => {
    router.replace({
      pathname: "/machine-finder" as any,
      params: { exerciseId },
    });
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isAnalyzing) return;
    setScanned(true);

    const rawText = data.trim();
    const lowerText = rawText.toLowerCase();

    // 1. CHECK IF SCANNED DATA IS A WEB URL
    const isUrl =
      lowerText.startsWith("http://") ||
      lowerText.startsWith("https://") ||
      lowerText.startsWith("www.") ||
      lowerText.includes(".com") ||
      lowerText.includes(".org") ||
      lowerText.includes(".net");

    if (isUrl) {
      let targetUrl = rawText;
      if (
        !targetUrl.startsWith("http://") &&
        !targetUrl.startsWith("https://")
      ) {
        targetUrl = `https://${targetUrl}`;
      }

      Alert.alert(
        "External Web Link Scanned",
        `Do you want to open this link in your browser?\n\n${targetUrl}`,
        [
          {
            text: "Open Link",
            onPress: async () => {
              try {
                const supported = await Linking.canOpenURL(targetUrl);
                if (supported) {
                  await Linking.openURL(targetUrl);
                } else {
                  Alert.alert("Error", "Cannot open this URL on your device.");
                }
              } catch (err) {
                Alert.alert("Error", "Failed to open link.");
              } finally {
                resetScanner();
              }
            },
          },
          {
            text: "Scan Again",
            onPress: () => resetScanner(),
            style: "cancel",
          },
        ],
        { cancelable: false },
      );
      return;
    }

    // 2. INTERNAL APP MACHINE MATCHING (e.g., "c6", "b9", "chest:c6")
    const scannedId = lowerText.includes(":")
      ? lowerText.split(":")[1].trim()
      : lowerText;
    const match = allExercises.find((ex) => ex.id.toLowerCase() === scannedId);

    if (match) {
      navigateToMachine(match.id);
    } else {
      Alert.alert(
        "Unrecognized Code",
        `Scanned code "${data.substring(0, 30)}" was not recognized.`,
        [
          { text: "Scan Again", onPress: () => resetScanner() },
          {
            text: "View Machine Guide",
            onPress: () => navigateToMachine("c6"),
          },
        ],
      );
    }
  };

  const handleIdentifyByPhoto = async () => {
    if (!cameraRef.current || isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });

      const targetExercise =
        allExercises.find((ex) => ex.id === "c6") || allExercises[0];
      setIsAnalyzing(false);
      navigateToMachine(targetExercise.id);
    } catch (error) {
      resetScanner();
      Alert.alert(
        "Capture Error",
        "Failed to capture image. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Machine Scanner</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.scanTarget} />
          <Text style={styles.scanText}>
            Align QR tag OR center the machine inside frame
          </Text>
        </View>

        <View style={styles.actionBar}>
          <Text style={styles.helperText}>
            Point at any machine QR tag or web link:
          </Text>

          <TouchableOpacity
            style={styles.snapButton}
            onPress={handleIdentifyByPhoto}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.snapButtonText}>
                📸 Snap Photo of Machine
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0f12" },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0d0f12",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e232d",
    backgroundColor: "#0d0f12",
    zIndex: 10,
  },
  backText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  text: {
    color: "#ffffff",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: "#ffffff", fontWeight: "800", fontSize: 14 },
  cameraWrapper: { flex: 1, width: "100%", position: "relative" },
  camera: { flex: 1, width: "100%" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  scanTarget: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: "#dc2626",
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  scanText: {
    color: "#ffffff",
    marginTop: 18,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(13, 15, 18, 0.95)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e232d",
  },
  helperText: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  snapButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  snapButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
