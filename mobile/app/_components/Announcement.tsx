import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import { Typography } from '../_styles/globals';
import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

interface AnnouncementProps {
  activityId: string;
  closeAnnouncement: () => void;
}

export default function Announcement({ activityId, closeAnnouncement }: AnnouncementProps) {
  const [announcement, setAnnouncement] = useState<AnnouncementData>();
  const [user, sendRequest] = useApiAuth();

  interface AnnouncementData {
    eventID: string;
    _id: string;
    content: { text: string }[];
    timeStart: string;
    timeEnd: string;
  }

  const fetchAnnouncement = async () => {
    try {
      const body = {};
      const requestType = RequestType.GET;
      const endpoint = `activities/${activityId}`;
      const data = await sendRequest({ body, requestType, endpoint });
      setAnnouncement(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [activityId]);

  if (!announcement) {
    return (
      <ScrollView>
        <Text style={styles.loadingText}>No active announcements at this time.</Text>
      </ScrollView>
    );
  }

  return (
    <View key={announcement._id} style={styles.card}>
      {/* <Text style={styles.timeText}>
        Aired on: {new Date(announcement.timeStart).toLocaleString()}
      </Text> */}
      <View style={styles.header}>
        <Text style={[Typography.h3, styles.headingText]}>
          ANNOUNCEMENT
        </Text>
        <TouchableOpacity onPress={closeAnnouncement}>
          <Image style={styles.icon} source={require('../../assets/activities/close_blue.png')} />
        </TouchableOpacity>
      </View>
      {announcement.content.map((textObj, index) => (
        <Text key={index} style={[Typography.body2, styles.announcementText]}>
          {textObj.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: width - 48,
  },
  timeText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  headingText: {
    fontSize: 26,
    color: "#10167F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  announcementText: {
    fontSize: 16,
    marginTop: 16,
    color: "#10167F99",
  },
  loadingText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  icon: {
    height: 30,
    width: 30,
  },
});
