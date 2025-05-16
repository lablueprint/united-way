import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Modal } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";

import useApiAuth from "@/app/_hooks/useApiAuth";
import { RequestType } from "@/app/_interfaces/RequestInterfaces";

interface UserDetails {
  name: string;
  registeredEvents: [string];
}

interface EventDetails {
  _id: string;
  name: string;
  checkedInUsers: [string];
}

export default function EventsRSVP() {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, setPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<EventDetails[]>([]);
  const [user, sendRequest] = useApiAuth();

  useEffect(() => {
    const getRegisteredEvents = async () => {
      try {
        const body = {};
        const requestType = RequestType.GET;
        const endpoint = "users/:id";
        const data = await sendRequest({ body, requestType, endpoint });

        const eventResponses = await Promise.all(
          data.registeredEvents.map((eventId: string) => {
            const body = {};
            const endpoint = `events/${eventId}`;
            const requestType = RequestType.GET;
            const data = sendRequest({ body, endpoint, requestType });
            return data;
          })
        );
        const rsvps = eventResponses.filter(Boolean);
        setRegisteredEvents(rsvps);
      } catch (err) {
        console.log(
          "Error fetching registered event details from user/event id:",
          err
        );
        console.error(err);
      }
    };
    getRegisteredEvents();
  });

  const handlePress = async () => {
    console.log("open scanner");
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission(status == "granted");

    if (status == "granted") {
      setScannerVisible(true);
    }
  };

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    // setEventId(data);
    // fetchEventDetails(data);
  };

  interface EventBlockProps {
    eventName: string;
  }

  const EventBlock = ({ eventName }: EventBlockProps) => {
    return (
      <Pressable style={styles.eventBlock} onPress={handlePress}>
        <View>
          <Text style={styles.eventBlockText}>{eventName}</Text>
        </View>
      </Pressable>
    );
  };

  const events = ["event1", "event2"];

  return (
    <View style={styles.container}>
      <Text>RSVP'd Events</Text>
      {registeredEvents.map((event, index) => (
        <EventBlock key={index} eventName={event.name} />
      ))}

      <Modal
        visible={scannerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <Pressable
            style={styles.closeBtn}
            onPress={() => setScannerVisible(false)}
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  eventBlock: {
    width: "100%",
    padding: 20,
    backgroundColor: "#d3d3d3",
    marginBottom: 15,
  },
  eventBlockText: {
    fontSize: 16,
    fontWeight: 700,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },

  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
  },
  closeBtnText: {
    color: "white",
  },
});
