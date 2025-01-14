import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import axios, { AxiosResponse } from "axios";

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    // Check if password is correct
    // TODO: Encryption stuff (currently compares raw strings)
    const targetUser = await getUserByEmail();
    if (targetUser === null || password != targetUser.password) {
      Alert.alert('Email or password is incorrect.');
      return;
    }
    // If password is correct, proceed to home screen
    // TODO: Redux (currently nothing is passed to the home screen)
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
        <Link href="/(tabs)" style={styles.text}>
          Skip this and go home
        </Link>
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