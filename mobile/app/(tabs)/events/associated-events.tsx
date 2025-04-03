import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useSelector } from 'react-redux';
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

// takes event data passed and populates list of events

// Exclude ID of original one you're clicking more of 
export default function associatedEvents() {
  const { id, exclude } = useLocalSearchParams();
  const org = useSelector((state) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
  const router = useRouter();


  const [associatedEvents, setAssociatedEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const getAssociatedEvents = async () => {
      try {
        // console.log('orgId', organizerId);
        const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/orgs/${id}/events`, {
          headers: {
            'Authorization': `Bearer ${org.authToken}`,
            'Content-Type': "application/json"
          },
        });
        const { data: eventIds } = response.data;
        const filteredEventIds = eventIds.filter((eventId: string) => eventId !== exclude);
        console.log(filteredEventIds);
        console.log(exclude);
        console.log('first worked');
        const eventRequests = filteredEventIds.map((eventId: string) => 
          axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${eventId}`,
          {
            headers: {
              'Authorization': `Bearer ${org.authToken}`,
              'Content-Type': "application/json"
            },
          }
          )
        );

        const eventResponses = await Promise.all(eventRequests);
        const fullEvents = eventResponses.map((res) => res.data.data);
        setAssociatedEvents(fullEvents);
    
        // return data;
      } catch (err) {
        console.error(err);
      }
    };
    getAssociatedEvents();
  // console.log('details', details);
  // console.log('fetching');
//   console.log(details);
  }, []);

  // To-Do: Mobile Event Card
  console.log('hi');
  console.log(associatedEvents);
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

    // <ScrollView contentContainerStyle={styles.container}>
    //   <Text style={styles.title}>Events from this organization:</Text>
    //   { associatedEvents.length === 0 ? (
    //       <Text>No associated events yet.</Text>
    //     ) : (
    //       associatedEvents.map((event: any) => (
    //       <TouchableOpacity
    //         key={event._id}
    //         style={styles.eventCard}
    //         onPress={() => router.push({ pathname: '/events/[id]', params: { id: event._id} })}
    //       >
    //         <Text style={styles.eventName}>{event.name}</Text>
    //         <Text style={styles.eventDescription}>{event.description}</Text>
    //       </TouchableOpacity>)))
    //   }
    // </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
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