import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    const eventId = data;

    // Mock API response
    const mockResponse = {
      id: eventId,
      name: `Event for ${eventId}`,
      description: `This is a mock description for event ${eventId}.`,
      org: "Mock Organization",
    };

    setEventDetails(mockResponse);
  };

  const handleAccept = () => {
    if (eventDetails) {
      const eventDetailsString = JSON.stringify(eventDetails);
      // Encode the event details to ensure safe passing via URL
      const encodedDetails = encodeURIComponent(eventDetailsString);
      router.push(`/events/event-details?details=${encodedDetails}`);
    }
  };

  const handleReject = () => {
    setEventDetails(null);
    setScanned(false);
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
          <Button title="Accept" onPress={handleAccept} />
          <Button title="Reject" onPress={handleReject} />
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