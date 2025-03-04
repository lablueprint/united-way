import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios, { AxiosResponse } from "axios";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

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
      console.log(event);
      console.log(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${event}`
      );
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
      console.error("Error fetching event:", err);
      return undefined;
    }
  };

  const getOrganizer = async (organizerId: string) => {
    try {
      console.log("Hi, I'm the organizer ID: ", organizerId);
      console.log(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/orgs/${organizerId}`
      );
      console.log("Making request to get organizer...");
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
        console.log("No response or empty response data");
        return undefined;
      }
      console.log("Received response:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching organizer:", err);
      return undefined;
    }
  };

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
    } catch (err) {
      console.error("Failed to add user to event:", err);
    }
  };

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
    } catch (err) {
      console.error("Failed to remove user from event:", err);
    }
  };

  // Decode and parse the event details
  // const parsedEventDetails = JSON.parse(
  //   decodeURIComponent(event as string)
  // ) as EventDetails;
  // 67bd5498a6c2df7326a4be2c
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getEventById();
      setEventData(data);
      console.log(data);
      const organizer = await getOrganizer(data.organizerID);
      console.log("Check the organizer: ", organizer);
      setOrganizerName(organizer.data.name);
      console.log("Check the organizer name: ", organizer.data.name);
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triangleButton}
        onPress={() => router.back()}
      />
      <Text style={styles.title}>{eventData.name}</Text>
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

const styles = StyleSheet.create({
  triangleButton: {
    position: "absolute",
    top: 60, // Added padding from top to account for status bar
    left: 20,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "blue",
    transform: [{ rotate: "90deg" }],
  },
  registerButton: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
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
