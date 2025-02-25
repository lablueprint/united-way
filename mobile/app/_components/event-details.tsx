import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

interface EventDetails {
  id: string;
  name: string;
  description: string;
  org: string;
}

export default function EventPage() {
  // Retrieve the 'details' query parameter from the URL
  const { details } = useLocalSearchParams();

  // Check if the details exist and parse them
  if (!details) {
    return <Text>No event details found.</Text>;
  }

  // Decode and parse the event details
  const parsedEventDetails = JSON.parse(
    decodeURIComponent(details as string)
  ) as EventDetails;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{parsedEventDetails.name}</Text>
      <Text style={styles.description}>{parsedEventDetails.description}</Text>
      <Text style={styles.organizer}>
        Organized by: {parsedEventDetails.org}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginVertical: 8,
  },
  organizer: {
    fontSize: 16,
    marginVertical: 8,
    fontStyle: "italic",
  },
});
