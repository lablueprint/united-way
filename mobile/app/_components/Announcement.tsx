import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

interface AnnouncementProps {
  id: string;
}

export default function Announcement({ id }: AnnouncementProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  interface AnnouncementData {
    eventID: string;
    _id: string;
    content: { text: string }[];
    timeStart: string;
    timeEnd: string;
  }

  const fetchAnnouncements = async () => {
    try {
      console.log("Fetching announcements for eventID:", id);
      const { data } = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/activities/filtered`,
        { eventID: id, type: "announcement" }
      );

      console.log("Fetched announcements:", data.data);

      if (data.data.length > 0) {
        const activeAnnouncements = data.data.filter((announcement: AnnouncementData) => {
          const now = new Date();
          const startTime = new Date(announcement.timeStart);
          const endTime = new Date(announcement.timeEnd);

          return now >= startTime && now <= endTime;
        });

        setAnnouncements(activeAnnouncements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => fetchAnnouncements(), 5000);
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0) {
    return (
      <ScrollView>
        <Text style={styles.loadingText}>No active announcements at this time.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      {announcements.map((announcement) => (
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
      ))}
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
