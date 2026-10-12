import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

export default function FoundationScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.brandRow} accessibilityLabel="FITAI">
          <View style={styles.brandMark} accessible accessibilityLabel="FITAI mark">
            <Text style={styles.brandLetter}>F</Text>
          </View>
          <Text style={styles.brandName}>FITAI</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>NATIVE APP FOUNDATION</Text>
          <Text style={styles.heading}>Your nutrition, made personal.</Text>
          <Text style={styles.body}>
            The iOS and Android app shell is in place. Sign-in, onboarding, food search, and tracking will be added in phases and connect to FITAI’s shared API.
          </Text>
        </View>

        <View style={styles.notice} accessibilityRole="summary">
          <Text style={styles.noticeTitle}>Foundation only</Text>
          <Text style={styles.noticeBody}>
            No account, food data, or nutrition totals are simulated in this build.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F7FB",
  },
  screen: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  brandRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#211F25",
  },
  brandLetter: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  brandName: {
    color: "#211F25",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  content: {
    gap: 14,
    paddingVertical: 48,
  },
  eyebrow: {
    color: "#A09DA5",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heading: {
    maxWidth: 340,
    color: "#211F25",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -2.4,
    lineHeight: 46,
  },
  body: {
    maxWidth: 430,
    color: "#77747C",
    fontSize: 16,
    lineHeight: 24,
  },
  notice: {
    gap: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAE9ED",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  noticeTitle: {
    color: "#211F25",
    fontSize: 13,
    fontWeight: "700",
  },
  noticeBody: {
    color: "#85838A",
    fontSize: 12,
    lineHeight: 18,
  },
});
