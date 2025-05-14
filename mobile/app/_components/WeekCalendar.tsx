import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Button, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Touchable, Image } from 'react-native';
import { useRouter } from 'expo-router';

import useApiAuth from '../_hooks/useApiAuth';
import { RequestType } from '../_interfaces/RequestInterfaces';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  currEventList: {
    flexDirection: 'row',
    gap: 20,
  },
  eventCard: {
    flexDirection: 'column',
    maxHeight: 100,
    gap: 12,
  },
  eventInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  eventDate: {
    fontSize: 12,
    textAlign: 'center',
  },
  eventLocation: {
    fontSize: 12,
    fontWeight: 200,
    textAlign: 'center',
  },
  dateNode: {
    paddingVertical: 4,
    gap: 12,
  },
  selectedDateNode: {

  },
  dayText: {
    color: '#2a2a2a',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: 10,
  },
  dateText: {
    color: '#2a2a2a',
    textAlign: 'center',
    padding: 12,
    borderRadius: 4,
    fontSize: 14,
  },
  selectedDateText: {
    color: '#000000',
    backgroundColor: '#f2f2f2',
    textAlign: 'center',
    padding: 8,
    borderRadius: 4,
  },
  // when styling this, container styles in relation to parent and siblings
  // reg style styles inside the container
  // why does flex parent contianer make contents grow into it
  // and flex content makes parent grow into thewhole page
  weekCalendarContainer: {
    justifyContent: 'space-between',
    gap: 10,
    margin: 0,
    flex: 1,
  },
  weekCalendarContents: {
    flexGrow: 0,
  },
  icon: {
    fontSize: 12,
    fontWeight: 700,
  },
  weekScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekRange: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 700,
  }
});
// location and time placeholders

const location = "Los Angeles, CA";
const startTime = "04:20";
const endTime = "16:20";

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

const getMonthAbbreviation = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
};

// start on Sunday
export default function WeekCalendar() {
  const [registeredEvents, setRegisteredEvents] = useState<EventData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [user, sendRequest] = useApiAuth();

  const week = useMemo(() => {
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - todayDate.getDay() + (weekOffset * 7));
    return Array.from({ length: 7 }, (_, i) => {
      const dateNode = new Date(startDate);
      dateNode.setDate(startDate.getDate() + i);
      return dateNode;
    });
  }, [weekOffset]);

  const weekRange = useMemo(() => {
    const sunday = week[0];
    const saturday = week[week.length - 1];

    const first = getMonthAbbreviation(sunday) + ' ' + sunday.getDate();
    const last = getMonthAbbreviation(saturday) + ' ' + saturday.getDate();

    return { first, last };
  }, [week]);

  // gets list of registered Event id
  useEffect(() => {
    const getRegisteredEvents = async () => {
      try {
        const body = {};
        const requestType = RequestType.GET;
        const endpoint = "users/:id";
        const data = await sendRequest({ body, requestType, endpoint });
        // ^ gives event ids
        const eventResponses = data.registeredEvents.map(async (eventId: string) => {
          const body = {};
          const endpoint = `events/${eventId}`;
          const requestType = RequestType.GET;
          return await sendRequest({ body, endpoint, requestType });
        });

        const fullEvents = eventResponses.map((res) => res.data.data).filter(Boolean);
        setRegisteredEvents(fullEvents);
      } catch (err) {
        console.error(err);
      }
    };
    getRegisteredEvents();
  }, []);

  const getTime = (date: Date) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDate = (date: Date) => {
    const eventDate = new Date(date);
    const todayDate = new Date();

    //temp utc string instead of date string bc of 1 day off formatting
    const isToday = todayDate.toISOString().split('T')[0] === eventDate.toISOString().split('T')[0];

    if (isToday) {
      return (<Text>Today</Text>);
    } else {
      const day = eventDate.getDate();
      const month = getMonthAbbreviation(eventDate);

      return (
        <Text>{month} {day}</Text>
      );
    }
  };

  // used for date comparLocalens
  const getDateStr = (date: Date) => new Date(date).toLocaleDateString().split('T')[0];

  const handleDatePress = (dateString: string) => {
    setSelectedDate(dateString);

    const index = registeredEvents.findIndex(
      (event) => getDateStr(new Date(event.date)) === dateString
    );

    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true, });
    }
  };

  return (
    <View style={styles.container} >
      <View style={styles.weekScroll}>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
          <Text style={styles.icon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.weekRange}>{weekRange.first} - {weekRange.last}</Text>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
          <Text style={styles.icon}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={week}
        keyExtractor={(item) => item.toLocaleDateString()}
        contentContainerStyle={styles.weekCalendarContainer}
        style={styles.weekCalendarContents}
        renderItem={({ item }) => {
          const dateString = getDateStr(item);
          const isSelected = selectedDate === dateString;

          return (

            <TouchableOpacity onPress={() => handleDatePress(dateString)}>
              <View style={[styles.dateNode, isSelected && styles.selectedDateNode]}>
                <Text style={[styles.dayText]}>
                  {item.toLocaleDateString("en-US", { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateText, { backgroundColor: isSelected ? '#D3D3D3' : '' }]}>
                  {item.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />
      {registeredEvents.length === 0 ? (
        <Text>No associated events yet.</Text>
      ) : (
        <FlatList
          horizontal
          ref={flatListRef}
          data={registeredEvents}
          contentContainerStyle={styles.currEventList}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                key={item._id}
                style={styles.eventCard}
                onPress={() => router.push({ pathname: '/events/[id]', params: { id: item._id } })}
              >
                <View style={styles.eventImage}>
                  <Image
                    source={{ uri: 'https://unitedway-uploads.s3.us-east-2.amazonaws.com/events/67bd5e928e73b7d338d2e1c8/1744350281645-bp_logo.jpg' }}
                    style={styles.eventImage}
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{item.name}</Text>
                  <Text style={styles.eventDate}>{getDate(item.date)} | {startTime} - {endTime}</Text>
                  <Text style={styles.eventLocation}>{location}</Text>
                </View>

              </TouchableOpacity>
            )
          }}
        />)}
    </View>
  );
}