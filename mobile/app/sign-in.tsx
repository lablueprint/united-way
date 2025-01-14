import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {

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
      </View>
      {/* Super special dev button */}
      <Link href="/(tabs)" style={styles.footer}>
        Skip this and go home
      </Link>
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
  },
  footer: {
    padding: 24,
  },
});