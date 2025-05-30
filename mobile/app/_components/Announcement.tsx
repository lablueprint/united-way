import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

interface AnnouncementProps {
  activityId: string;
}

export default function Announcement({ activityId }: AnnouncementProps) {
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
    <ScrollView>
      <View key={announcement._id} style={styles.card}>
        <Text style={styles.timeText}>
          Aired on: {new Date(announcement.timeStart).toLocaleString()}
        </Text>

        {announcement.content.map((textObj, index) => (
          <Text key={index} style={styles.announcementText}>
            {textObj.text}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  announcementText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});
