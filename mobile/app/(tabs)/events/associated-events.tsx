import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';

interface EventData {
  _id: string;
  name: string;
  date: Date;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  organizerID: string;
  tags: string[];
  registeredUsers: string[];
}

// Exclude ID of original one you're clicking more of 
export default function associatedEvents() {
  const { id, exclude } = useLocalSearchParams();
  const router = useRouter();
  const [user, sendRequest] = useApiAuth();


  const [associatedEvents, setAssociatedEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const getAssociatedEvents = async () => {
      try {
        const body = {};
        const endpoint = `orgs/${id}/events`;
        const requestType = RequestType.GET;
        const data = await sendRequest({ body, endpoint, requestType });
        const filteredEventIds = data.filter((eventId: string) => eventId !== exclude);
        const fullEvents = await Promise.all(filteredEventIds.map((eventId: string) => {
          const body = {};
          const endpoint = `events/${eventId}`;
          const requestType = RequestType.GET
          const data = sendRequest({ body, endpoint, requestType });
          return data;
        }));
        setAssociatedEvents(fullEvents);
      } catch (err) {
        console.error(err);
      }
    };
    getAssociatedEvents();
  }, []);

  // To-Do: Mobile Event Card
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Events from this organization:</Text>
      {associatedEvents.length === 0 ? (
        <Text>No associated events yet.</Text>
      ) : (
        associatedEvents.map((event: any) => (
          <TouchableOpacity
            key={event._id}
            style={styles.eventCard}
            onPress={() => router.push({ pathname: '/events/[id]', params: { id: event._id } })}
          >
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 64,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
});