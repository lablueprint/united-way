"use client"
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import axios from "axios";
import { useSelector } from 'react-redux';
import DropDownPicker from 'react-native-dropdown-picker';

interface Event {
  _id: string;
  name: string;
  date: string;
}

export default function FilterPassport() {
  const user = useSelector((state: any) => { return { userId: state.auth.userId, authToken: state.auth.authToken } });
  const [userEventDetails, setUserEventsDetails] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [open, setOpen] = useState(false);
  const [isEventsFetched, setIsEventsFetched] = useState(false);
  const [items, setItems] = useState([
    {label: 'Most Recent', value: 'mostRecent'},
    {label: 'Least Recent', value: 'lestRecent'},
]);
  const [sortOrder, setSortOrder] = useState<'mostRecent' | 'leastRecent'>('mostRecent');

  useEffect(() => {
      fetchUserEventDetails();
  }, []);

   useEffect(() => {
    if (isEventsFetched) {
      sortEvents(sortOrder);
    }
  }, [isEventsFetched, sortOrder]); 

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
          setUserEventsDetails(response.data.data.registeredEvents || []);
          const eventIDs = response.data.data.registeredEvents;
          let eventData = [];
          for (let i = 0; i < eventIDs.length; i++)
          {
            const event = await fetchUserEvent(eventIDs[i]);
            if (event !== null)
            {
              eventData.push(event);
            }
          }
          setEvents(eventData);
          setIsEventsFetched(true);
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
        return response.data.data;
    } catch (err) {
        console.error('Error fetching events:', err);
        return null;
    }
};

  const sortEvents = (order: 'mostRecent' | 'leastRecent') => {
      const sortedEvents = [...events].sort((a, b) => {
          const comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          return order === 'mostRecent' ? comparison : -comparison;
      });
      setEvents(sortedEvents);
  };

  const handleSortChange = (itemValue: string) => {
      if (itemValue === 'mostRecent' || itemValue === 'leastRecent') {
          setSortOrder(itemValue);
      }
  };

  const eventMap = events.map((event) => (
    <View key={event._id} style={styles.eventCard}>
        <View style={styles.cardHeader}>
            <Text style={styles.eventName}>{event.name}</Text>
        </View>
        <View style={styles.cardBody}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>
                    {new Date(event.date).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoValue}>
                    {new Date(event.date).toLocaleTimeString()}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID:</Text>
                <Text style={styles.infoValue}>{event._id}</Text>
            </View>
        </View>
    </View>)
  )

  return (
      <View style={styles.container}>
        <Text style={styles.header}>Passport</Text>
        <View style={styles.dropDownLabelContainer}>
          <Image
            source={{uri: "https://icons.veryicon.com/png/o/miscellaneous/partme/filter-147.png"}}
            style={styles.filterImage}
          />
          <Text style={styles.filterText}>Filter By: </Text>
          <DropDownPicker style={styles.dropDown}
                  textStyle={styles.dropDownText}
                  open={open}
                  value={sortOrder}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSortOrder}
                  setItems={setItems}
                  containerStyle={{borderRadius: 36, width: 140}}
            />
         </View>
        <ScrollView>
          <View style={styles.eventList}>
          {events.length > 0 ? (
              eventMap
            ) : (
              <Text style={styles.noEventsText}>No events found in your passport</Text>
            )}
          </View>
          </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#ffffff',
  },
  pickerContainer: {
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: {
    height: 15,
    width: '100%',
    backgroundColor: '#f5f5f5',
    color: '#333333',
  },
  pickerItem: {
    height: 50,
    color: '#333333',
  },
  eventList: {
    gap: 12,
  },
  eventDate: {
    fontSize: 14,
    color: '#999999',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    backgroundColor: '#333333',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardBody: {
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 24,
  },
  dropDownLabelContainer: {
    flexDirection: 'row',         // Align items in a row (horizontal)
    justifyContent: 'center',    // Center the components horizontally
    alignItems: 'center',        // Center the components vertically
    marginLeft: 10,  
    marginBottom: 10,         // Optional: add margin around the container
  },
  dropDown: {
    borderRadius: 36,
    backgroundColor: '#D3D3D3',
    width: 140,
    padding: 0,
    height: 20,
    minHeight: 0,
  },
  dropDownText: {
    fontSize: 10,
    padding: 0,
  },
  filterImage: {
    width: 20,                   // Optional: set the width of the icon
    height: 20,                  // Optional: set the height of the icon
    marginRight: 5,
  },
  filterText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
}
);