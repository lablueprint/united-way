import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";

// Define your Event interface outside the component
interface Event {
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

// Define your navigation parameter list
type RootStackParamList = {
  "event-details": { event: Event };
};

const styles = StyleSheet.create({
  titletext: {
    fontSize: 40,
    paddingTop: 50,
    paddingLeft: "8%",
    color: "white",
  },
  eventsTitle: {
    fontSize: 20,
    paddingTop: 5,
    paddingLeft: "8%",
    color: "white",
  },
  eventsDate: {
    fontSize: 15,
    paddingTop: 5,
    paddingLeft: "8%",
    color: "white",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#2C2C2C",
    marginTop: 20,
    paddingBottom: 100,
  },
});

export default function Events() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const router = useRouter();
  const user = useSelector((state) => {
    return {
      userId: state.auth.userId,
      authToken: state.auth.authToken,
      refreshToken: state.auth.refreshToken,
    };
  });

  const getEvents = async () => {
    console.log("hi caroline");
    try {
      const response: AxiosResponse<Event[]> = await axios.get<Event[]>(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/`,
        {
          headers: {
            Authorization: `Bearer ${user.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const content = response.data;
      return content;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  useEffect(() => {
    fetchEvents();
    console.log("hi angela");
  }, []);

  const fetchEvents = async () => {
    const { data } = await getEvents();
    console.log(data);
    setAllEvents(data);
  };

  return (
    <View>
      <Text style={styles.titletext}>Events</Text>
      <ScrollView>
        {allEvents && allEvents.length !== 0
          ? allEvents.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.scrollView}
                onPress={() =>
                  router.push(`/explore/event-details/?event=${event._id}`)
                }
              >
                <Text style={styles.eventsTitle}>{event.name}</Text>
                <Text style={styles.eventsDate}>{event.date}</Text>
              </TouchableOpacity>
            ))
          : null}
      </ScrollView>
    </View>
  );
}


//add the offset from the bottom for the scroll for the first 10 items
//scroll to an element offset and expand the total elements in the view
//add a visible scroll bar on the right side of the screen
