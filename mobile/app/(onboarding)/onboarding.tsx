import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import React, { useState } from "react";

const pages = [
  {
    key: 1,
    title: "STAY CONNECTED",
    subtitle:
      "Choose the communities you want to engage with — whether it’s your neighborhood, school, or city. We’ll make sure you see events and rewards that matter to you.",
    label: "APP OVERVIEW",
    background: require("../../assets/images/onboarding/background-1.png"),
  },
  {
    key: 2,
    title: "CREATE YOUR PROFILE",
    subtitle:
      "Tell us a little about yourself and choose the communities you care about. This helps us tailor events, rewards, and experiences just for you.",
    label: "PROFILE PAGE",
    background: require("../../assets/images/onboarding/background-2.png"),
  },
  {
    key: 3,
    title: "EVENTS MADE FOR YOU",
    subtitle:
      "Discover events tailored to your interests and location. View details, sign up, and check in when you arrive to unlock live event features like polls, surveys, announcements, and raffles.",
    label: "EXPLORE PAGE",
    background: require("../../assets/images/onboarding/background-3.png"),
  },
  {
    key: 4,
    title: "COMMUNITY LEVELS",
    subtitle:
      "Grow with your community by showing up, participating, and engaging. Earn achievements to unlock rewards that level up with you!",
    label: "REWARDS PAGE",
    background: require("../../assets/images/onboarding/background-4.png"),
  },
  {
    key: 5,
    title: "EARN POINTS, GET REWARDS",
    subtitle:
      "Every action counts! Collect points and stamps at events, climb tiers, and redeem awesome rewards — from in-app goodies to real-world prizes.",
    label: "REWARDS PAGE",
    background: require("../../assets/images/onboarding/background-5.png"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const current = pages[page];

  const handleContinue = () => {
    if (page < pages.length - 1) {
      setPage(page + 1);
    } else {
      router.push("/interest");
    }
  };

  const handleSkip = () => {
    router.push("/interest");
  };

  return (
    <ImageBackground source={current.background} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.label}>{current.label}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          <View style={styles.progressDots}>
            {pages.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === page ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {page === pages.length - 1 ? "LET'S GET STARTED" : "CONTINUE"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    marginVertical: 50,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 200,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "#C6C6DC",
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 16,
    marginBottom: 4,
    marginTop: 110,
    fontFamily: "BarlowCondensedBoldItalic",
  },
  title: {
    fontSize: 48,
    textTransform: "uppercase",
    color: "white",
    marginBottom: 24,
    fontFamily: "BarlowCondensedBoldItalic",
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    fontFamily: "Helvetica",
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 24,
    marginBottom: 24,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "white",
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "#5E5E80",
  },
  continueButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 18,
  },
  continueButtonText: {
    color: "#1A1A8E",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textTransform: "uppercase",
  },
  skipText: {
    textAlign: "center",
    color: "#C6C6DC",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textDecorationLine: "underline",
    marginBottom: 20,
  },
});
