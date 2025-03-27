import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import axios, { AxiosResponse } from "axios";

interface EventDetails {
  id: string;
  name: string;
  description: string;
  org: string;
}

export default function EventScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [eventId, setEventId] = useState("");
  const user = useSelector((state) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    setEventId(data);
    fetchEventDetails(data);
  };

  const fetchEventDetails = async (eventId: string) => {
    try {
      const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${user.authToken}`,
          'Content-Type': "application/json"
        },
      });
      const { data } = response.data;
      setEventDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addEventToUser = async (eventId: string) => {
    try {
      await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}/addEvent`,
        {
          newEvent: eventId,
        },
        {
          headers: {
            'Authorization': `Bearer ${user.authToken}`,
            'Content-Type': "application/json"
          },
        });
    } catch (err) {
      console.error(err);
    }
  }

  const addUserToEvent = async (userId: string) => {
    try {
      await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${eventId}/addUser`,
        {
          newUser: userId,
        },
        {
          headers: {
            'Authorization': `Bearer ${user.authToken}`,
            'Content-Type': "application/json"
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };


  const removeUserFromEvent = async (userId: string) => {
    try {
      const response: AxiosResponse = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${eventId}/removeUser`,
        {
          userId: userId,
        },
        {
          headers: {
            'Authorization': `Bearer ${user.authToken}`,
            'Content-Type': "application/json"
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  const removeEventFromUser = async (eventId: string) => {
    try {
      const response: AxiosResponse = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}/removeEvent`,
        {
          eventId: eventId,
        },
        {
          headers: {
            'Authorization': `Bearer ${user.authToken}`,
            'Content-Type': "application/json"
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  }

  const handleRegister = () => {
    addEventToUser(eventId);
    addUserToEvent(user.userId);
  };

  const handleUnregister = () => {
    removeEventFromUser(eventId);
    removeUserFromEvent(user.userId);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (eventDetails) {
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
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventName: {
    fontSize: 20,
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});