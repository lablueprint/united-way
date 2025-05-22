import {
  StyleSheet,
  Pressable,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import axios, { AxiosResponse } from "axios";
import { login } from "../_utils/redux/userSlice";
import { useDispatch } from "react-redux";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    // Check if password is correct
    const targetUser = await getUserByEmail();
    const signIn = await verifySignIn();
    if (targetUser === null || signIn === null) {
      Alert.alert("Email or password is incorrect.");
      return;
    }
    dispatch(
      login({
        userId: targetUser._id,
        authToken: signIn.accessToken,
        refreshToken: signIn.refreshToken,
      })
    );
    // If password is correct, proceed to home screen
    router.push({ pathname: "/(tabs)" });
  };

  const getUserByEmail = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/email/${email}`
      );
      return response.data.data;
    } catch (err) {
      console.log(err);
    }
  };

  const verifySignIn = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/auth/userLogin`,
        {
          email: email,
          password: password,
        }
      );
      return response.data.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/onboarding/splash.png")}
        style={styles.background}
      >
        <View style={styles.formContainer}>
          <Image
            source={require("../../assets/images/onboarding/uw-logo.png")}
            style={styles.logo}
          />
          <View style={styles.formBox}>
            <Text style={styles.title}>SIGN IN</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry
                />
              </View>
              <Pressable>
                <Text style={styles.forgotPassword}>FORGOT YOUR PASSWORD?</Text>
              </Pressable>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
            >
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            </TouchableOpacity>

            <View style={styles.createAccountSection}>
              <Text style={styles.createAccountLabel}>FIRST TIME HERE?</Text>
              <TouchableOpacity
                onPress={() => { router.dismissTo('/(onboarding)/sign-up'); }}
              >
                <Text style={styles.createAccountLink}>
                  SIGN UP
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Language selector */}
        <View style={styles.languageContainer}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>ES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, styles.languageButtonActive]}
          >
            <Text style={[styles.languageText, styles.languageTextActive]}>
              EN
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, resizeMode: "cover" },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 10,
    alignSelf: "center",
  },
  formBox: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    color: "white",
    fontSize: 60,
    fontFamily: "BarlowCondensedBoldItalic",
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: -0.02 * 48,
    marginBottom: 40,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 8,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  input: {
    color: "white",
    backgroundColor: "rgba(81, 84, 125, 0.9)",
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  profileImageContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -15 }],
    backgroundColor: "white",
    borderRadius: 15,
    padding: 2,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  forgotPassword: {
    color: "#fff",
    textDecorationLine: "underline",
    alignSelf: "flex-end",
    marginTop: 8,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  signInButton: {
    backgroundColor: "rgb(255, 255, 255)",
    padding: 16,
    borderRadius: 50,
    marginTop: 16,
  },
  signInButtonText: {
    color: "#10167F",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    textTransform: "uppercase",
  },
  createAccountSection: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  createAccountLabel: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    fontFamily: "Helvetica",
  },
  createAccountLink: {
    color: "white",
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontFamily: "Helvetica",
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    marginTop: 20,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: 2,
    alignSelf: "center",
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  languageButtonActive: {
    backgroundColor: "#10167F",
  },
  languageText: {
    fontSize: 16,
    color: "#333",
  },
  languageTextActive: {
    color: "white",
  },
});
