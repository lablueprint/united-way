import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import { useRouter, Redirect, Link } from 'expo-router';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { login } from '../_utils/redux/userSlice';
import { useLocalSearchParams } from 'expo-router';

enum SignUpState {
  SignUpForm, // 0
  TwoFactor, // 1
}

export default function SignUpScreen() {
  const { tempId } = useLocalSearchParams();
  // Signup form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2FA fields
  const [code, setCode] = useState("");
  const [hashedCode, setHashedCode] = useState("");

  const [storedUser, setStoredUser] = useState<{ userId: string, authToken: string, refreshToken: string }>({});

  // State to control the flow: 0 = Signup form; 1 = Two-Factor Verification
  const [state, setState] = useState(SignUpState.SignUpForm);

  const dispatch = useDispatch();
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedUser != null) {
        setStoredUser(JSON.parse(storedUser));
      }

      if (tempId == undefined && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        dispatch(
          login({
            userId: parsedUser.userId,
            authToken: parsedUser.authToken,
            refreshToken: parsedUser.refreshToken,
          })
        );
        router.push("/(tabs)");
      }
    };
    checkUser();
  }, []);

  // Validate email using a regex pattern (adjust if needed)
  const validateEmail = () => {
    return email.toLowerCase().match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/);
  };

  // Validate password: at least 12 characters, including uppercase, lowercase, symbol, and number
  const validatePassword = () => {
    return password.match(
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,}$/
    );
  };

  // Check overall input validity
  const validateInputs = () => {
    if (!validateEmail()) {
      Alert.alert("Enter a valid email.");
      return false;
    } else if (!validatePassword()) {
      Alert.alert(
        "Enter a valid password. Your password must contain at least 12 characters including an uppercase letter, a lowercase letter, a symbol, and a number."
      );
      return false;
    }
    return true;
  };

  // Check if email already exists in the database
  const userExists = async (): Promise<any> => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/email/${email}`
      );
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  };

  // STEP 1: Handle signup – validate inputs and check for existing user
  const handleSignUp = async () => {
    if (!validateInputs()) return;

    const existingUser = await userExists();
    if (existingUser) {
      Alert.alert("This email is already associated with an account.");
      return;
    }
    // Email is not in use; proceed with sending OTP for 2FA
    sendOTP();
  };

  // STEP 2: Send OTP to email for two-factor authentication
  const sendOTP = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/twofactor/sendOTP`,
        { email } // sending the email to the backend
      );
      if (response.data) {
        setHashedCode(response.data); // store hashed OTP returned from backend
        setState(SignUpState.TwoFactor); // move to OTP verification step
      } else {
        Alert.alert("Error: OTP not received.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      Alert.alert("Error sending OTP.");
    }
  };

  // STEP 3: Verify the OTP code entered by the user
  const verifyOTP = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/twofactor/verifyCode`,
        { code, hashedCode }
      );
      if (response.data === true) {
        // OTP verified, proceed to add the user to the database
        addUserToDatabase();
      } else {
        Alert.alert("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      Alert.alert("Error verifying OTP.");
    }
  };

  // STEP 4: Add user to the database after OTP verification succeeds
  const addUserToDatabase = async () => {
    try {
      const timestamp = Date.now(); // Get the current timestamp in milliseconds
      const date = new Date(timestamp); // Convert timestamp to a Date object

      // Extract year, month, and day
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so add 1
      const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for day

      // Format as YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;

      if (tempId == undefined) {
        const response: AxiosResponse = await axios.post(
          `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
          {
            email: email,
            password: password,
            dateJoined: formattedDate,
            profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxuutX8HduKl2eiBeqSWo1VdXcOS9UxzsKhQ&s"
          }
        );
        dispatch(login({
          userId: response.data.data._id,
          authToken: response.data.authToken,
          refreshToken: response.data.refreshToken
        }));
        router.push({ pathname: "/onboarding", params: { id: response.data.data._id, authToken: response.data.authToken } });
      } else {
        const response: AxiosResponse = await axios.patch(
          `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
          {
            email: email,
            password: password,
            dateJoined: formattedDate,
            profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxuutX8HduKl2eiBeqSWo1VdXcOS9UxzsKhQ&s"
          }
        );
        router.push({ pathname: "/onboarding", params: { id: tempId, authToken: storedUser.authToken } })
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error creating user.");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/onboarding/splash.png")}
        style={styles.background}
      >
        {state === 0 ? (
          // Signup Form
          <View style={styles.formContainer}>
            <Image
              source={require("../../assets/images/onboarding/uw-logo.png")}
              style={styles.logo}
          {/* {
            tempId != 
          } */}
          <Text style={styles.title}>
            Sign up
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.formBox}>
              <Text style={styles.title}>Sign Up</Text>
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
                <TextInput
                  style={styles.input}
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry
                />
              </View>
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
                {/*make it onPress handleAddUser right now it temporarily goes to two factor auth */}
              </TouchableOpacity>

              <View style={styles.loginSection}>
                <Text style={styles.loginLabel}>ALREADY HAVE AN ACCOUNT?</Text>
                <Link style={styles.loginLink} href="/sign-in">
                  SIGN IN
                </Link>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>2-Step Verification</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.button} onPress={verifyOTP}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText} >Sign up</Text>
            {/*make it onPress handleAddUser right now it temporarily goes to two factor auth */}
          </TouchableOpacity>

          {tempId != undefined ?
            <></> : (
              <View>
                <View style={styles.loginSection}>
                  <Text style={styles.loginLabel}>ALREADY HAVE AN ACCOUNT?</Text>
                  <Link style={styles.loginLink} href="/sign-in">
                    Already have an account? Sign in
                  </Link>
                </View>
                <View style={styles.skipSection}>
                  <Text style={styles.skipLabel}>DON'T WANNA MAKE AN ACCOUNT?</Text>
                  <Link style={styles.skipLink} href="/">
                    Continue to dashboard </Link>
                </View>
              </View>
            )}

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
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
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
    fontSize: 18,
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  signUpButton: {
    backgroundColor: "rgb(255, 255, 255)",
    padding: 16,
    borderRadius: 50,
    marginTop: 16,
  },
  signUpButtonText: {
    color: "#10167F",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    lineHeight: 24,
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: "rgb(4, 52, 110)",
    padding: 16,
    borderRadius: 50,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Helvetica",
    lineHeight: 24,
    textTransform: "uppercase",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  loginLabel: {
    color: "#fff",
    fontFamily: "Helvetica",
    fontWeight: "bold",
  },
  loginLink: {
    color: "#fff",
    textDecorationLine: "underline",
    fontFamily: "Helvetica",
    fontWeight: "bold",
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
