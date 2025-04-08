import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios, { AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// Required interfaces from schema
interface EventDetails {
  _id: string;
  name: string;
  date: Date;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  organizerId: string;
  tags: string[];
  registeredUsers: string[];
  activities: Activity[];
  image: string;
  duration: number;
}
export interface Activity {
  _id: string;
  eventID: string;
  type: string;
  content: unknown;
  timeStart: Date;
  timeEnd: Date;
  active: boolean;
}

export default function EventsDetails() {
  // Retrieve the 'details' query parameter from the URL
  const { event } = useLocalSearchParams();
  const user = useSelector((state) => {
    return {
      userId: state.auth.userId,
      authToken: state.auth.authToken,
      refreshToken: state.auth.refreshToken,
    };
  });
  // Set event data to null states
  const [eventData, setEventData] = useState<EventDetails>({
    organizerId: "",
    _id: "",
    name: "",
    date: new Date(),
    description: "",
    location: {
      type: "",
      coordinates: [],
    },
    tags: [],
    registeredUsers: [],
    activities: [],
    image: "",
    duration: 0,
  });
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState<string>("");
  const [userRegistered, setUserRegistered] = useState<boolean>(false);

  // Check if the details exist and parse them
  if (!event) {
    return <Text>No event details found.</Text>;
  }
  const getEventById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${event}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.authToken}`,
          },
        }
      );
      // If the event is returned directly, just return response.data:
      return response.data;
    } catch (err) {
      return undefined;
    }
  };

  const getOrganizer = async (organizerId: string) => {
    try {
      // Fetch the organizer details using the organizerId
      const response: AxiosResponse = await axios.get(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/orgs/${organizerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.authToken}`,
          },
        }
      );
      if (!response || !response.data) {
        return undefined;
      }
      return response.data;
    } catch (err) {
      return undefined;
    }
  };

  // Used when a user registers for an event
  const addUser = async (eventID: string) => {
    try {
      await axios.patch(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${event}/addUser/`,
        { newUser: user.userId },
        {
          headers: {
            Authorization: `Bearer ${user.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {}
  };

  // Used when a user unregisters from an event
  const removeUserFromEvent = async (eventID: string) => {
    try {
      await axios.patch(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${event}/removeUser/`,
        { userId: user.userId },
        {
          headers: {
            Authorization: `Bearer ${user.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {}
  };

  // Decode and parse the event details
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getEventById();
      setEventData(data);
      const organizer = await getOrganizer(data.organizerID);
      setOrganizerName(organizer.data.name);
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => router.back()}
      >
        <View style={styles.triangleButton} />
      </TouchableOpacity>
      <Text style={styles.title}>{eventData.name}</Text>
      <Image source={{ uri: eventData.image }} style={styles.eventImage} />
      <Text style={styles.description}>{eventData.description}</Text>
      <Text style={styles.organizer}>
        Organized by: {organizerName ? organizerName : "Loading..."}
      </Text>
      {userRegistered ? (
        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: "green" }]}
          onPress={async () => {
            await removeUserFromEvent(eventData._id);
            setUserRegistered(false);
          }}
        >
          <Text style={styles.buttonText}>Registered</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={async () => {
            await addUser(eventData._id);
            setUserRegistered(true);
          }}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Styles for the component

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    top: 60, // Adjust as needed for status bar
    left: 20,
    padding: 10,
  },
  triangleButton: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 0,
    borderRightWidth: 25, // Adjust size
    borderTopWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "black", // Change to preferred color
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  registerButton: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  eventImage: {
    height: 200,
    width: 200,
    borderRadius: 100,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
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
