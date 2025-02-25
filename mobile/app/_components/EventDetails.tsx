import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios, { AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

interface EventDetails {
  id: string;
  name: string;
  description: string;
  organizerID: string;
}
interface Organization {
  name: string;
}

export default function EventsDetails() {
  // Retrieve the 'details' query parameter from the URL
  const { event } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const user = useSelector((state) => {
    return {
      userId: state.auth.userId,
      authToken: state.auth.authToken,
      refreshToken: state.auth.refreshToken,
    };
  });
  const { id, authToken } = params;
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState<string>("");
  // Define a function to fetch the organizer details
  const getOrganizer = async (organizerID: string) => {
    try {
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${organizerID}`,
        {
          headers: {
            Authorization: `Bearer ${user.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.data as Organization;
    } catch (err) {
      console.error("Failed to get organizer:", err);
      return null;
    }
  };
  // Check if the details exist and parse them
  if (!event) {
    return <Text>No event details found.</Text>;
  }

  // Decode and parse the event details
  const parsedEventDetails = JSON.parse(
    decodeURIComponent(event as string)
  ) as EventDetails;
  useEffect(() => {
    console.log("Parsed Event Details:", parsedEventDetails);
    console.log("Organizer Name:", organizerName);
  }, [parsedEventDetails, organizerName]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triangleButton}
        onPress={() => router.push(`/explore/events-tab/`)}
      />
      <Text style={styles.title}>{parsedEventDetails.name}</Text>
      <Text style={styles.description}>{parsedEventDetails.description}</Text>
      <Text style={styles.organizer}>
        Organized by: {organizerName ? organizerName : "Loading..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  triangleButton: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "blue", // or any other color
    marginBottom: 16,
  },
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
