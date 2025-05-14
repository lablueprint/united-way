import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

// Event interface from schema
interface Event {
  _id: string;
  name: string;
  date: Date;
  description: string;
  image: string;
  duration: number;
}

//Stylesheet
const styles = StyleSheet.create({
  titletext: {
    fontSize: 40,
    paddingTop: 50,
    textAlign: "center",
    color: "black",
  },
  eventCard: {
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  eventInfo: {
    fontSize: 14,
    color: "#666",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#333",
  },
  filterText: {
    color: "#333",
  },
  filterTextActive: {
    color: "#fff",
  },
});

export default function EventsFeed() {
  //gather all the different events
  const [events, setEvents] = useState<Event[]>([]);
  //for filtering events
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const router = useRouter();
  const [user, sendRequest] = useApiAuth();

  // Fetch all events at once
  const getEvents = async (): Promise<Event[]> => {
    try {
      const body = {};
      const requestType = RequestType.GET;
      const endpoint = "events/";
      const data = await sendRequest({ body, requestType, endpoint });
      return data;
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsData = await getEvents();
      setEvents(eventsData);
    };
    fetchEvents();
  }, []);

  // Compute a sorted version of events without mutating state.
  const sortedEvents = useMemo(() => {
    if (activeFilter === "date") {
      return [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    if (activeFilter === "name") {
      return [...events].sort((a, b) => a.name.localeCompare(b.name));
    }
    return events;
  }, [activeFilter, events]);

  const filterOptions = [
    { label: "Date", value: "date" },
    { label: "Name", value: "name" },
    { label: "Location", value: "location" },
  ];

  // Format date to show "FEB 4 | 4:30 - 7:30 PM" format
  const formatEventDate = (date: Date, duration: number) => {
    const eventDate = new Date(date);
    const month = eventDate
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const day = eventDate.getDate();
    const time = eventDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Added duration to the event date assuming duration is in hours
    const endDate = new Date(eventDate.getTime() + duration * 60 * 60 * 1000);
    const endTime = endDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${month} ${day} | ${time} - ${endTime}`;
  };

  // Render each event item
  // The location is hardcoded to "LOS ANGELES, CA" for now
  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push({
        pathname: `/events/[id]`,
        params:
        {
          id: item._id,
          origin: 'explore/events-tab'
        }
      })}
    >
      <Image source={{ uri: item.imageURL }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.name}</Text>
        <Text style={styles.eventInfo}>
          {formatEventDate(item.date, item.duration)}
        </Text>
        <Text style={styles.eventInfo}>LOS ANGELES, CA</Text>
      </View>
    </TouchableOpacity >
  );

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <Text style={styles.titletext}>Events</Text>
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              activeFilter === option.value && styles.filterButtonActive,
            ]}
            onPress={() =>
              setActiveFilter(
                activeFilter === option.value ? null : option.value
              )
            }
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === option.value && styles.filterTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 80,
        }}
      />
    </View>
  );
}
