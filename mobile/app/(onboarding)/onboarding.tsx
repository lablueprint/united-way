import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import DropDownPicker from "react-native-dropdown-picker";

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, authToken } = params;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [community, setCommunity] = useState("");
  // Gender selector
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null);
  const [items, setItems] = useState([
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ]);

  const [title, setTitle] = useState("What is your name?");
  const [subtitle, setSubtitle] = useState(
    "Please enter your first and last name"
  );
  const [placeholder, setPlaceholder] = useState("Name");
  const [textInput, setTextInput] = useState("");
  const [dropDownInput, setDropDownInput] = useState(null);
  const [state, setState] = useState(1);

  const [user, sendRequest] = useApiAuth();

  const handleEditUser = async () => {
    try {
      const body = {
        name: name,
        phoneNumber: phone,
        demographics: {
          ethnicity: ethnicity,
          community: community,
          gender: gender,
        },
      };
      const requestType = RequestType.PATCH;
      const endpoint = `users/${id}`;
      await sendRequest({ requestType, endpoint, body });

      // Navigate to home screen
      router.push({ pathname: "/interest" });
      //router.push("/(tabs)");
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (state == 1) {
      setTitle("What is your name?");

      setSubtitle("Please enter your first and last name");
      setPlaceholder(name || "Name");
      setTextInput(name);
    } else if (state == 2) {
      setTitle("Phone Number");
      setName(textInput);

      setSubtitle("Enter your number to receive updates");
      setPlaceholder(phone || "Phone Number");
      setTextInput(phone);
    } else if (state == 3) {
      setTitle("Language");

      setPhone(textInput);
      setSubtitle("Enter your Preferred Language");
      setPlaceholder(ethnicity || "Language");
      setTextInput(ethnicity);
    } else if (state == 4) {
      setTitle("Community");
      setEthnicity(textInput);

      setSubtitle("Enter your Community");
      setPlaceholder(community || "Community");
      setTextInput(community);
    } else if (state == 5) {
      setTitle("Gender");
      setCommunity(textInput);
      setSubtitle("Enter your Gender");
      setPlaceholder(gender || "Please select");
      setTextInput("");
    } else if (state == 6) {
      setGender(dropDownInput);
      handleEditUser();
    }
  }, [state]); // Runs when `state` changes

  const handleContinue1 = async () => {
    setState((state) => state + 1);
  };

  const handleBack = async () => {
    if (state > 1) {
      setState((state) => state - 1); // Decrease the state first
    }
  };

  return (
    <ImageBackground
      source={
        state === 1
          ? require("../../assets/images/onboarding/name-background.png")
          : state === 2
          ? require("../../assets/images/onboarding/phone-background.png")
          : state === 3
          ? require("../../assets/images/onboarding/language-background.png")
          : state === 4
          ? require("../../assets/images/onboarding/community-background.png")
          : state === 5
          ? require("../../assets/images/onboarding/gender-background.png")
          : null
      }
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.formContainer}>
          {state != 6 ? (
            <View style={styles.content}>
              {state != 1 ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>&lt; Back</Text>
                </TouchableOpacity>
              ) : (
                <></>
              )}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <View style={styles.progressDots}>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.dot,
                        state === step ? styles.activeDot : styles.inactiveDot,
                      ]}
                    />
                  ))}
                </View>
              </View>
              {state != 5 ? (
                <TextInput
                  style={styles.input}
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder={placeholder}
                />
              ) : (
                <DropDownPicker
                  open={open}
                  value={gender}
                  items={items}
                  setOpen={setOpen}
                  setValue={setGender}
                  setItems={setItems}
                  placeholder="Gender"
                />
              )}

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue1}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
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
    marginTop: 100,
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
    marginBottom: 20, // tighter spacing between text and input
  },
  title: {
    fontSize: 48,
    textTransform: "uppercase",
    color: "white",
    marginBottom: 12,
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
    marginTop: 8,
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
  input: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
  },
  continueButtonText: {
    color: "#1A1A8E",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
