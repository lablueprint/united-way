import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import axios, { AxiosResponse } from "axios";
import { io, Socket } from "socket.io-client";
import { useRef } from 'react';

interface EventDetails {
  id: string;
  name: string;
  description: string;
  org: string;
  startDate: string;
  endDate: string;
  registeredUsers: string[];
}

export default function EventScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [registered, setRegistered] = useState(false);
  const [joinedRaffles, setJoinedRaffles] = useState(false);
  const [raffleNumber, setRaffleNumber] = useState<number | null>(null);
  const [scanned, setScanned] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [eventId, setEventId] = useState("");
  const [eventEnded, setEventEnded] = useState(false);
  const user = useSelector((state: { auth: { userId: string, authToken: string, refreshToken: string } }) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } });
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // Indicate that the event has ended if the end date is in the past
    if (eventDetails) {
      const endTimeDiff = new Date(eventDetails.endDate).getTime() - new Date().getTime();
      if (endTimeDiff <= 0) {
        setEventEnded(true);
      } else {
        setTimeout(() => {
          setEventEnded(true);
        }, endTimeDiff);
      }
    }
  }, [eventDetails]);

  useEffect(() => {
    if (registered && eventDetails && eventDetails.registeredUsers.includes(user.userId)) {
      // Connect to the socket server
      socketRef.current = io(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}`);
      const socket = socketRef.current;
      // Send a message to the server
      socket.emit('message', `Connecting at ${new Date()}`);
      // Join the event room
      socket.emit('join event', eventDetails);
      // Listen for messages from the server
      socket.on('message', (data) => {
        console.log('Message from server:', data);
      });
      // Listen for event and activity updates
      socket.on('event start', (data) => {
        console.log('Event started:', data.name);
        Alert.alert('Event started', `The event ${data.name} has started!`);
      });
      socket.on('event end', (data) => {
        console.log('Event ended:', data.name);
        setEventEnded(true);
        Alert.alert('Event ended', `The event ${data.name} has ended!`);
      });
      socket.on('activity start', (data) => {
        console.log('Activity started:', data.type);
        Alert.alert('Activity started', `An activity of type ${data.type} has started.`);
      });
      socket.on('activity end', (data) => {
        console.log('Activity ended:', data.type);
        Alert.alert('Activity ended', `An activity of type ${data.type} has ended.`);
      });
      // Listen for raffle updates
      socket.on('new raffle number', (data) => {
        console.log('New raffle number:', data.raffleNumber);
        setRaffleNumber(data.raffleNumber);
      });
      socket.on('raffle winner', (data) => {
        Alert.alert(`Raffle result: ${data.randomRaffleNumber}`, 'You won the raffle!');
      });
      socket.on('raffle loser', (data) => {
        Alert.alert(`Raffle result: ${data.randomRaffleNumber}`, 'You did not win the raffle. Better luck next time!');
      });
      // Listen for disconnection
      socket.on('disconnect', () => {
        socketRef.current = null;
        console.log('Disconnected from server');
      });
    }
  }, [registered]);

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
      setEventDetails((prevDetails) => 
        JSON.stringify(prevDetails) !== JSON.stringify(data) ? data : prevDetails
      );
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
    setRegistered(true);
    if (eventDetails && !eventDetails.registeredUsers.includes(user.userId)) {
      addEventToUser(eventId);
      addUserToEvent(user.userId);
    }
  };

  const handleDeregister = () => {
    setRegistered(false);
    if (eventDetails && eventDetails.registeredUsers.includes(user.userId)) {
      removeEventFromUser(eventId);
      removeUserFromEvent(user.userId);
      socketRef.current?.disconnect();
      socketRef.current = null;
    }
  };

  const handleJoinRaffles = () => {
    if (!joinedRaffles && eventDetails && eventDetails.registeredUsers.includes(user.userId)) {
      setJoinedRaffles(true);
      socketRef.current?.emit('join raffle', eventDetails);
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (eventDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Preliminary event page</Text>
        <Text style={styles.eventName}>{eventDetails.name}</Text>
        {
          !eventEnded && (
            // Display register/deregister button and raffle information
            <View>
              {!registered && <Button title="Register" onPress={handleRegister} />}
              {registered && <Button title="Deregister" onPress={handleDeregister} />}
              {registered && !joinedRaffles && <Button title="Join raffles" onPress={handleJoinRaffles} />}
              {registered && joinedRaffles && raffleNumber && <Text>Your raffle number is {raffleNumber}.</Text>}
            </View>
          )
        }
        {eventEnded && <Text>Event has ended.</Text>}
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