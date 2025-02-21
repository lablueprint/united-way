import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Link, useRouter, Redirect } from 'expo-router';

export default function VerificationScreen() {
  const [code, setCode] = useState('067785');
  const router = useRouter();

  const handleLocation = async () => {
    router.push({ pathname: "/location" });
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>2-Step Verification</Text>
            <Text style={styles.subtitle}>
              Enter the code at designated number
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="Enter verification code"
          />

          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText} onPress={handleLocation}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    outerContainer: {
      flex: 1,
      padding: 2,
      backgroundColor: '#007AFF',
    },
    container: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 40,
    },
    content: {
      flex: 1,
      padding: 20,
      marginTop: 40,
    },
    header: {
      marginBottom: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
    },
    input: {
      backgroundColor: '#F5F5F5',
      padding: 16,
      borderRadius: 8,
      fontSize: 18,
      marginBottom: 24,
      letterSpacing: 1,
    },
    continueButton: {
      backgroundColor: 'black',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    continueButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });
