import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState(["Sports"]);

  const interests = [
    "Sports",
    "Entertainment",
    "Food",
    "Technology",
    "Wellness",
    "Music",
    "Pets",
    "Shopping",
    "Reading",
    "Travel",
    "Home",
    "Vehicles",
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    router.push({ pathname: "/(tabs)" });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/onboarding/interest-background.png")}
        style={styles.background}
      >
        <View style={styles.content}>
          <Text style={styles.number}>3</Text>
          <Text style={styles.title}>What are your interests?</Text>
          <Text style={styles.subtitle}>
            This will help us surface the events most relevant to you.
          </Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tagsContainer}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestTag,
                    selectedInterests.includes(interest) && styles.selectedTag,
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest) &&
                        styles.selectedText,
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Let's get started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  number: {
    fontFamily: "BarlowCondensedBoldItalic",
    fontSize: 60,
    color: "white",
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    color: "white",
    marginVertical: 8,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 32,
    fontFamily: "Helvetica",
  },
  scrollView: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#8888A0",
    borderColor: "rgba(16,22,127,0.2)",
    borderWidth: 1,
  },
  selectedTag: {
    backgroundColor: "white",
    borderColor: "rgba(16,22,127,0.2)",
  },
  interestText: {
    fontSize: 14,
    color: "#10167F",
    fontFamily: "Helvetica",
  },
  selectedText: {
    fontSize: 14,
    color: "#10167F",
    fontFamily: "Helvetica",
  },
  continueButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 100,
    alignItems: "center",
    marginBottom: 80,
  },
  continueButtonText: {
    color: "#10167F",
    fontSize: 18,
    textTransform: "uppercase",
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
});
