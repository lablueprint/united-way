import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";

// Define your Event interface outside the component
interface Event {
  id: string;
  name: string;
  date: string;
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
});

export default function Events() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const router = useRouter();

  const getEvents = async () => {
    console.log("hi caroline");
    try {
      const response: AxiosResponse<Event[]> = await axios.get<Event[]>(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/`
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
      {allEvents && allEvents.length !== 0
        ? allEvents.map((event) => (
            <View key={event.id}>
              <TouchableOpacity
                style={styles.eventsTitle}
                onPress={() =>
                  router.push(
                    `/explore/event-details/?event=${encodeURIComponent(
                      JSON.stringify(event)
                    )}`
                  )
                }
              >
                <Text style={styles.eventsTitle}>{event.name}</Text>
              </TouchableOpacity>
              <Text style={styles.eventsDate}>{event.date}</Text>
            </View>
          ))
        : null}
    </View>
  );
}
