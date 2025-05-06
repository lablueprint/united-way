import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, Redirect, Link } from 'expo-router';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useDispatch } from 'react-redux';
import { login } from '../_utils/redux/userSlice';

enum SignUpState {
  SignUpForm, // 0
  TwoFactor   // 1
}

export default function SignUpScreen() {
  // Signup form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 2FA fields
  const [code, setCode] = useState('');
  const [hashedCode, setHashedCode] = useState('');

  // State to control the flow: 0 = Signup form; 1 = Two-Factor Verification
  const [state, setState] = useState(SignUpState.SignUpForm);

  const [verificationMethod, setVerificationMethod] = useState<'email' | 'sms'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');

  const dispatch = useDispatch();
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await SecureStore.getItemAsync("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        dispatch(login({
          userId: parsedUser.userId,
          authToken: parsedUser.authToken,
          refreshToken: parsedUser.refreshToken,
        }));
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
    return password.match(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,}$/);
  };

  // Check overall input validity
  const validateInputs = () => {
    if (!validateEmail()) {
      Alert.alert('Enter a valid email.');
      return false;
    } else if (!validatePassword()) {
      Alert.alert('Enter a valid password. Your password must contain at least 12 characters including an uppercase letter, a lowercase letter, a symbol, and a number.');
      return false;
    }
    if (verificationMethod == 'sms' && phoneNumber.length < 8) {
      Alert.alert('Please enter a valid phone number.')
      return false;
    }
    return true;
  };

  // Check if email already exists in the database
  const userExists = async (): Promise<any> => {
    try {
      const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/email/${email}`);
      return response.data.data;
    } catch (err) {
      console.error(err);
    }
  };

  // STEP 1: Handle signup – validate inputs and check for existing user
  const handleSignup = async () => {
    if (!validateInputs()) return;

    const existingUser = await userExists();
    if (existingUser) {
      Alert.alert('This email is already associated with an account.');
      return;
    }
    // Email is not in use; proceed with sending OTP for 2FA
    verificationMethod === 'email' ? sendOTPEmail() : sendOTPSMS();
  };

  // Send OTP to email for two-factor authentication
  const sendOTPEmail = async () => {
    try {
      const response: AxiosResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/twofactor/sendOTP`,
        { email }  // sending the email to the backend
      );
      if (response.data) {
        setHashedCode(response.data);  // store hashed OTP returned from backend
        setState(SignUpState.TwoFactor);  // move to OTP verification step
      } else {
        Alert.alert("Error: OTP not received.");
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      Alert.alert('Error sending OTP.');
    }
  };

  // Send OTP to phone number for two-factor authentication
  const sendOTPSMS = async () => {
    try {
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+1${phoneNumber}`;
  
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/twofactor/sendSMS`,
        { phoneNumber: formattedPhone }
      );
  
      if (response.data.status === 'success') {
        setState(SignUpState.TwoFactor);
      } else {
        Alert.alert("Error sending SMS.");
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
      Alert.alert("Error sending SMS verification code.");
    }
  };
  
  const verifyOTP = async () => {
    if (verificationMethod === 'email') {
      try {
        const response = await axios.post(
          `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/twofactor/verifyCode`,
          { code, hashedCode }
        );
        if (response.data === true) {
          addUserToDatabase();
        } else {
          Alert.alert("Invalid OTP. Please try again.");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error verifying OTP.");
      }
    } else {
      try {
        const formattedPhone = phoneNumber.startsWith('+')
          ? phoneNumber
          : `+1${phoneNumber}`;

        const response = await axios.post(
          `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/twofactor/verifySMS`,
          { phoneNumber: formattedPhone, code }
        );

        if (response.data.status === 'success') {
          addUserToDatabase();
        } else {
          Alert.alert("Invalid code");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Verification failed.");
      }
    }
  };

  // Add user to the database after OTP verification succeeds
  const addUserToDatabase = async () => {
    try {
      const timestamp = Date.now(); // Get the current timestamp in milliseconds
      const date = new Date(timestamp); // Convert timestamp to a Date object

      // Extract year, month, and day
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
      const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits for day

      // Format as YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;

      const userData: any = {
        email,
        password,
        dateJoined: formattedDate,
        profilePicture: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxuutX8HduKl2eiBeqSWo1VdXcOS9UxzsKhQ&s"
      };
      
      if (verificationMethod === 'sms') {
        userData.phoneNumber = phoneNumber
      }
      
      const response: AxiosResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
        userData
      );

      dispatch(login({
        userId: response.data.data._id,
        authToken: response.data.authToken,
        refreshToken: response.data.refreshToken
      }));
      router.push({
        pathname: "/onboarding",
        params: {
          id: response.data.data._id,
          authToken: response.data.authToken,
          verificationMethod // <- verification method gets added
        }
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error creating user.");
    }
  };

  return (
    <View style={styles.container}>
      {state === 0 ? (
        // Signup Form
        <View style={styles.formContainer}>
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
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>VERIFY USING</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setVerificationMethod('email')}>
                <Text style={[styles.option, verificationMethod === 'email' && styles.selectedOption]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVerificationMethod('sms')}>
                <Text style={[styles.option, verificationMethod === 'sms' && styles.selectedOption]}>
                  SMS
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {verificationMethod === 'sms' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="234567890"
                onChangeText={setPhoneNumber}
                value={phoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          )}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
            <Text style={styles.signUpButtonText} >Sign up</Text>
            {/*make it onPress handleAddUser right now it temporarily goes to two factor auth */}
          </TouchableOpacity>
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

          {/* Super special dev button */}
          {/* <Link href="/(tabs)" style={styles.text}>
                    Skip this and go home
                </Link> */}
        </View>
      ) : (
        // Two-Factor Verification Form
        <View style={{
          marginHorizontal: 50,
        }}>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },

  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  chatBubble: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 3,
  },
  profileImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  signUpButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginSection: {
    marginTop: 40,
  },
  loginLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  loginLink: {
    color: '#666',
    textDecorationLine: 'underline',
  },
  skipSection: {
    marginTop: 40,
  },
  skipLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  skipLink: {
    color: '#666',
    textDecorationLine: 'underline',
  },
  option: { 
    padding: 10, 
    fontSize: 16, 
    color: '#555' 
  },
  selectedOption: { 
    fontWeight: 'bold', 
    color: 'black', 
    textDecorationLine: 'underline' 
  },
});
