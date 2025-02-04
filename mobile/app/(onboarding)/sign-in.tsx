import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
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
    await dispatch(login({
      userId: targetUser._id,
      authToken: signIn.accessToken,
      refreshToken: signIn.refreshToken
    }))
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
      <View style={styles.content}>
        <Text style={styles.text}>
          For returning users:
        </Text>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleSignIn}>
          <Text>
            Sign in
          </Text>
        </TouchableOpacity>
        <Link href="/">
          Don't have an account? Sign up
        </Link>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    margin: 24,
  }
});