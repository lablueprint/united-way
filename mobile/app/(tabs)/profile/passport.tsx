"use client"
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

interface Event {
  id: string;
  name: string;
  date: string;
}

export default function FilterPassport() {
  const user = useSelector((state) => { return { userId: state.auth.userId, authToken: state.auth.authToken } });
  const [userEventDetails, setUserEventsDetails] = useState<Event[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'mostRecent' | 'leastRecent'>('mostRecent');

  useEffect(() => {
      fetchUserEventDetails();
  }, []);

  // for (let i = 0; i < )

  useEffect(() => {
      sortEvents(sortOrder);
  }, [sortOrder]);

  const fetchUserEventDetails = async () => {
    console.log("in fetch user event details");
      try {
        console.log(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`)
          const response = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`,
              {
                  headers: {
                      'Authorization': `Bearer ${user.authToken}`,
                      'Content-Type': 'application/json'
                  },
              }
          );
          console.log(response);
          // setUserEventsDetails(response.data.registeredEvents || []);
      } catch (err) {
          console.error('Error fetching events:', err);
      }
  };

  const fetchUserEvent = async (eventId: string) => {
    try {
        const response = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${eventId}`,
            {
                headers: {
                    'Authorization': `Bearer ${user.authToken}`,
                    'Content-Type': 'application/json'
                },
            }
        );
        setEvents(response.data || []);
    } catch (err) {
        console.error('Error fetching events:', err);
    }
};

  const sortEvents = (order: 'mostRecent' | 'leastRecent') => {
      const sortedEvents = [...events].sort((a, b) => {
          const comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          return order === 'mostRecent' ? comparison : -comparison;
      });
      setEvents(sortedEvents);
  };

  return (
      <View style={styles.container}>
          <View style={styles.buttonContainer}>
              <Button
                  title="Most Recent"
                  onPress={() => setSortOrder('mostRecent')}
                  color={sortOrder === 'mostRecent' ? '#666666' : '#999999'}
              />
              <Button
                  title="Least Recent"
                  onPress={() => setSortOrder('leastRecent')}
                  color={sortOrder === 'leastRecent' ? '#666666' : '#999999'}
              />
          </View>
          
          <View style={styles.eventList}>
              {events.map((event) => (
                  <View key={event.id} style={styles.eventCard}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <Text style={styles.eventDate}>
                          {new Date(event.date).toLocaleDateString()}
                      </Text>
                  </View>
              ))}
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#ffffff',
  },
  buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
      gap: 12,
  },
  eventList: {
      gap: 12,
  },
  eventCard: {
      backgroundColor: '#f5f5f5',
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  eventName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#666666',
      marginBottom: 4,
  },
  eventDate: {
      fontSize: 14,
      color: '#999999',
  },
});