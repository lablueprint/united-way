import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter, usePathname, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';

interface EventDetails {
  id: string;
  name: string;
  description: string;
  org: string;
}

export default function EventScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

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
      <Button
        title={'Scan'}
        onPress={() => {
          if (scanned || hasNavigated) return;
          setScanned(true);
          setHasNavigated(true); // LOCK so you don’t scan again until reset
          router.push({
            pathname: `/events/[id]`,
            params:
            {
              id: '67e97896bc526b5f26311365',
              origin: '/events/scanner'
            }
          });
        }
        }
      />
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