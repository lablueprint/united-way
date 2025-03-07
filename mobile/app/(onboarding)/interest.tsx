import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState(['Sports']);

  const interests = [
    'Sports', 'Entertainment', 'Food',
    'Technology', 'Wellness', 'Music',
    'Pets', 'Shopping', 'Reading',
    'Travel', 'Home', 'Vehicles'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    router.push({ pathname: "/(tabs)" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What are your interests?</Text>
        <Text style={styles.subtitle}>
          This will help us surface the events most relevant to you.
        </Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.interestsContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tagsContainer}>
            {interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestTag,
                  selectedInterests.includes(interest) && styles.selectedTag,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest) && styles.selectedText,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Let's get started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  interestsContainer: {
    paddingBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestTag: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
  },
  selectedTag: {
    backgroundColor: '#1A1A1A',
  },
  interestText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  selectedText: {
    color: 'white',
  },
  continueButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});