import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter, usePathname, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import axios, { AxiosResponse } from "axios";
import Announcement from "../../_components/Announcement";
import { io, Socket } from "socket.io-client";
import { useRef } from 'react';

interface EventDetails {
  id: string;
  name: string;
  description: string;
  org: string;
  startDate: string;
  endDate: string;
}

export default function EventScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [eventId, setEventId] = useState("");
  const [hasNavigated, setHasNavigated] = useState(false);


  const user = useSelector((state: { auth: { userId: string, authToken: string, refreshToken: string } }) => {
    return {
      userId: state.auth.userId,
      authToken: state.auth.authToken,
      refreshToken: state.auth.refreshToken
    }
  });

  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (eventDetails) {
      const startTimeDiff = new Date(eventDetails.startDate).getTime() - new Date().getTime();
      const endTimeDiff = new Date(eventDetails.endDate).getTime() - new Date().getTime();
      if (startTimeDiff <= 0 || endTimeDiff <= 0) {
        Alert.alert("Event has already started or is in the past.");
      } else if (startTimeDiff > endTimeDiff) {
        Alert.alert("Event end time is before start time.");
      } else {
        setTimeout(() => {
          socketRef.current = io(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}`);
          socketRef.current.emit('message', 'Hello, server!');
          socketRef.current.on('message', (data) => {
            console.log('Server says:', data);
          });
        }, startTimeDiff);
        setTimeout(() => {
          socketRef.current?.emit('message', 'Goodbye, server!');
          socketRef.current?.disconnect();
        }, endTimeDiff);
      }
    }
  }, [eventDetails]);

  useFocusEffect(
    useCallback(() => {
      if (scanned) setScanned(false);
      setHasNavigated(false);
    }, [scanned])
  );

  const handleBarCodeScanned = ({ type, data }: any) => {
    if (scanned || hasNavigated) return;
    setScanned(true);
    setHasNavigated(true); // LOCK so you don’t scan again until reset

    if (pathname === '/events/[id]' && params.id === data) return;

    router.push({
      pathname: `/events/[id]`,
      params:
      {
        id: data,
        origin: '/events/scanner'
      }
    });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (eventDetails) {
    const now = new Date();
    const dateString = now.toISOString();
    console.log(dateString);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Request to Join Event</Text>
        <Text style={styles.eventName}>{eventDetails.name}</Text>
        <View style={styles.buttonContainer}>
          <Button title="Accept" onPress={handleRegister} />
          <Button title="Reject" onPress={handleUnregister} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Scan the event QR code to proceed.</Text>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned || hasNavigated ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => {
          setScanned(false);
          setHasNavigated(false);
        }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  eventName: {
    fontSize: 20,
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
});
