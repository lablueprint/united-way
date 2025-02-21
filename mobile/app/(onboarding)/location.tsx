import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Link, useRouter, Redirect } from 'expo-router';

export default function LocationScreen() {
  const [location, setLocation] = useState('Los Angeles');
  const router = useRouter();

  const handleContinue = async () => {
    router.push({ pathname: "/interest" });
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Where are you located?</Text>
            <Text style={styles.subtitle}>
              This will help us surface the events most relevant to you.
            </Text>
          </View>

          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            maxLength={6}
            placeholder="Enter Location"
          />

          <TouchableOpacity style={styles.continueButton}>
            <Text style={styles.continueButtonText} onPress = {handleContinue}>Continue</Text>
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
