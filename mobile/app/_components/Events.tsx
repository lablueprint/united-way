import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";

// Define your Event interface
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
    paddingLeft: "4%",
    color: "white",
  },
  scrollView: {
    display: "flex",
    flexDirection: "row",
    height: 100,
    alignItems: "center",
  },
});

export default function Events() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [sortOption, setSortOption] = useState<string | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => ({
    userId: state.auth.userId,
    authToken: state.auth.authToken,
    refreshToken: state.auth.refreshToken,
  }));

  const getEvents = async () => {
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
      return response.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await getEvents();
    setAllEvents(data);
  };

  // Compute a sorted version of allEvents without mutating state.
  const sortedEvents = useMemo(() => {
    if (sortOption === "date") {
      return [...allEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    if (sortOption === "name") {
      return [...allEvents].sort((a, b) => a.name.localeCompare(b.name));
    }
    return allEvents;
  }, [sortOption, allEvents]);

  return (
    <View style={{ backgroundColor: "grey", height: "100%" }}>
      <Text style={styles.titletext}>Events</Text>
      <View>
        <TouchableOpacity
          onPress={() => setShowPicker(!showPicker)}
          style={{
            padding: 10,
            backgroundColor: "black",
            alignSelf: "center",
            marginVertical: 10,
          }}
        >
          <Text style={{ color: "white" }}>
            {sortOption ? `Sorted by: ${sortOption}` : "Sort Events"}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <View>
            <Picker
              selectedValue={sortOption}
              onValueChange={(itemValue) => setSortOption(itemValue)}
              style={{
                backgroundColor: "black",
                color: "white",
              }}
              itemStyle={{
                backgroundColor: "black",
                color: "white",
                fontSize: 16,
              }}
            >
              <Picker.Item label="Sort by Date" value="date" />
              <Picker.Item label="Sort by Name" value="name" />
            </Picker>
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={{
                padding: 10,
                backgroundColor: "black",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScrollView style={{ height: "100%" }}>
        {sortedEvents && sortedEvents.length !== 0
          ? sortedEvents.map((event) => (
              <TouchableOpacity
                key={event._id}
                style={styles.scrollView}
                onPress={() =>
                  router.push(`/explore/event-details/?event=${event._id}`)
                }
              >
                <Image
                  source={{
                    uri: "https://reactnative.dev/img/tiny_logo.png",
                  }}
                  style={{ width: 50, height: 50 }}
                />
                <View>
                  <Text style={styles.eventsTitle}>{event.name}</Text>
                  <Text style={styles.eventsDate}>{event.date}</Text>
                </View>
              </TouchableOpacity>
            ))
          : null}
      </ScrollView>
    </View>
  );
}
