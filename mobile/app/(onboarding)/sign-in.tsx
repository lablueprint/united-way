import { StyleSheet, Pressable, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import axios, { AxiosResponse } from "axios";
import { login } from '../_utils/redux/userSlice';
import { useDispatch } from 'react-redux';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    // Check if password is correct
    const targetUser = await getUserByEmail();
    const signIn = await verifySignIn();
    if (targetUser === null || signIn === null) {
      Alert.alert('Email or password is incorrect.');
      return;
    }
    dispatch(login({
      userId: targetUser._id,
      authToken: signIn.accessToken,
      refreshToken: signIn.refreshToken
    }));
    // If password is correct, proceed to home screen
    router.push({ pathname: "/(tabs)" });
  }

  const getUserByEmail = async () => {
    try {
      const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/email/${email}`);
      return response.data.data;
    } catch (err) {
      console.log(err);
    }
  }

  const verifySignIn = async () => {
    try {
      const response: AxiosResponse = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/auth/userLogin`,
        {
          email: email,
          password: password
        }
      );
      return response.data.data;
    } catch (err) {
      console.log(err);
      return null;
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          Login
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
            />
          </View>
          <Pressable>
            <Text style={styles.forgotPassword}>Forgot your password?</Text>
          </Pressable>
        </View>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>
            Sign in
          </Text>
        </TouchableOpacity>

        <View style={styles.createAccountSection}>
          <Text style={styles.createAccountLabel}>FIRST TIME HERE?</Text>
          <Link style={styles.createAccountLink} href="/sign-up"> Create your account now </Link>
        </View>

        <View style={styles.skipSection}>
          <Text style={styles.skipLabel}>DON'T WANNA MAKE AN ACCOUNT?</Text>
          <Link style={styles.skipLink} href="/"> Continue to dashboard </Link>
        </View>
        {/* Super special dev button */}
        {/* <Link href="/(tabs)" style={styles.text}>
          Skip this and go home
        </Link> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  profileImageContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  forgotPassword: {
    color: '#666',
    textDecorationLine: 'underline',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  signInButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountSection: {
    marginTop: 40,
  },
  createAccountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  createAccountLink: {
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
});