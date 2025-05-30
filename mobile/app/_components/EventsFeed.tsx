import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Typography, Color } from "../_styles/global";

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

export default function EventsFeed() {
  // gather all the different events
  const [events, setEvents] = useState<Event[]>([]);
  // for filtering events
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
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
    { label: "Location", value: "location" },
    { label: "Name", value: "name" },
    { label: "Date", value: "date" },
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
        pathname: `/explore/[id]`,
        params:
        {
          id: item._id,
          origin: 'explore/events-tab'
        }
      })}
    >
      <Image source={item.imageURL ? { uri: item.imageURL } : require("../../assets/images/explore/defaultEventImage.png")} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <Text style={[Typography.h3, styles.eventTitle]}>
          {item.name}
        </Text>
        <Text style={styles.eventDate}>
          {formatEventDate(item.date, item.duration)}
        </Text>
        <Text style={[Typography.body2, styles.eventLocation]}>LOS ANGELES, CA</Text>
      </View>
    </TouchableOpacity >
  );


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[Typography.h3, styles.title]}>EXPLORE</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Image source={require("../../assets/images/explore/bookmark.png")} style={styles.bookmarkIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { router.push({ pathname: "/profile" }); }}>
            <Image source={require("../../assets/images/explore/profile.png")} style={styles.profileIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter section */}
      <View style={styles.filterSection}>
        {/* Searchbar */}
        <View style={styles.searchContainer}>
          <Image source={require("../../assets/images/explore/search.png")} style={styles.searchIcon} />
          <TextInput
            value={search}
            placeholder="Search"
            placeholderTextColor="#9FA2CC"
            style={[Typography.body2, styles.searchInput]}
            onChangeText={(text) => { setSearch(text); }}
          />
        </View>
        <View style={styles.divider}>
        </View>
        <View style={styles.filterContainer}>
          <Text style={[Typography.body2, styles.filterText]}>
            Sort by
          </Text>
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
                  Typography.body2,
                  styles.filterText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Events display */}
      <FlatList
        data={sortedEvents.filter((event) => {
          if (search !== "") {
            return event.name.includes(search);
          }
          return true;
        })}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 248,
          backgroundColor: Color.uwLightBlue,
          rowGap: 8
        }}
      />
    </SafeAreaView>
  );
}

//Stylesheet
const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    rowGap: 16,
    backgroundColor: "#FFFFFF"
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24
  },
  headerIcons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    columnGap: 13
  },
  filterSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
    marginHorizontal: 24
  },
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    columnGap: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 22, 127, 0.2)",
    borderRadius: 100,
  },
  searchInput: {
    fontSize: 16,
    color: Color.uwDarkBlue,
    width: "90%",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: Color.uwDarkBlue,
    opacity: 0.1
  },
  title: {
    fontSize: 36,
    color: Color.uwDarkBlue
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 14
  },
  eventImage: {
    width: 64,
    height: 64,
    borderRadius: 5,
  },
  eventContent: {
    display: "flex",
    flexDirection: "column",
    rowGap: 6
  },
  eventTitle: {
    fontSize: 16,
    color: Color.uwDarkBlue,
    textTransform: "capitalize"
  },
  eventDate: {
    fontSize: 14,
    color: Color.uwDarkBlue,
  },
  eventLocation: {
    fontSize: 12,
    color: Color.uwDarkBlue,
    opacity: 0.4
  },
  filterContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  filterText: {
    fontSize: 14,
    color: Color.uwDarkBlue
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(16, 22, 127, 0.2)"
  },
  filterButtonActive: {
    backgroundColor: "rgba(16, 22, 127, 0.1)",
  },
  bookmarkIcon: {
    width: 32,
    height: 32
  },
  profileIcon: {
    width: 40,
    height: 40
  },
  searchIcon: {
    width: 18,
    height: 18
  }
});