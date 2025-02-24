import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

interface AnnouncementProps {
  id: string;
}

export default function Announcement({ id }: AnnouncementProps) {
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  interface AnnouncementData {
    eventID: string;
    _id: string;
    content: { text: string }[];
    timeStart: string; 
    timeEnd: string;
  }

  const fetchAnnouncement = async () => {
    try {
      console.log("Fetching announcement for eventID:", id);
      const { data } = await axios.post(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/activities/filtered`,
        { eventID: id, type: "announcement" }
      );

      console.log("Fetched announcements:", data.data[0]);

      if (data.data.length > 0) {
        setAnnouncement(data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
    }
  };

  const checkVisibility = () => {
    if (!announcement) return;

    const now = new Date();
    const startTime = new Date(announcement.timeStart);
    const endTime = new Date(announcement.timeEnd);

    setIsVisible(now >= startTime && now <= endTime);
  };

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  useEffect(() => {
    if (announcement) {
      checkVisibility();
      const interval = setInterval(checkVisibility, 5000);
      return () => clearInterval(interval);
    }
  }, [announcement]);

  if (!announcement || !isVisible) {
    return null; 
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
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
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
});
