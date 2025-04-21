import { useState, useEffect, useRef } from 'react';
import { View, Button, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Touchable, Image} from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { AxiosResponse } from 'axios';

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
    console.log('date', date);
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
};

// start on Sunday
const getWeek = () => {
    const todayDate = new Date();
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - todayDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const dateNode = new Date(startDate);
        dateNode.setDate(startDate.getDate() + i);
        return dateNode;
    });
};

const getWeekRange = () => {
    const week = getWeek(); // array of date objects
    const sunday = week[0]; // first of week
    const saturday = week[week.length-1]; // last of week

    const first = getMonthAbbreviation(sunday) + ' ' + sunday.getDate();
    const last = getMonthAbbreviation(saturday)+ ' ' + saturday.getDate();
    return {first, last};
}

export default function WeekCalendar () {
    const user = useSelector((state: { auth: { userId: string, authToken: string, refreshToken: string } }) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    const org = useSelector((state) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    
    const [registeredEvents, setRegisteredEvents] = useState<EventData[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    // gets list of registered Event id
    useEffect(() => {
    const getRegisteredEvents = async () => {
        try {
        console.log()
        const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`, {
            headers: {
            'Authorization': `Bearer ${user.authToken}`,
            'Content-Type': "application/json"
            },
        });
        // ^ gives event ids

        const eventRequests = response.data.data.registeredEvents.map((eventId: string) => axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/${eventId}`,
        {
            headers: {
            'Authorization': `Bearer ${org.authToken}`,
            'Content-Type': "application/json"
            },
        }
        )
        );

        const eventResponses = await Promise.all(eventRequests);
        const fullEvents = eventResponses.map((res) => res.data.data).filter(Boolean);
        setRegisteredEvents(fullEvents);
        console.log(registeredEvents);
        } catch (err) {
        console.error(err);
        }
    };
    getRegisteredEvents();
    }, []);

  const getTime= (date: Date) => {
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
//    console.log('is it today?', isToday);
//    console.log('today date', todayDate.toISOString());
//    console.log('eventdate', eventDate.toISOString())

    if (isToday) { 
      return (<Text>Today</Text>);
    } else {
      const day = eventDate.getUTCDate();      
      const month = getMonthAbbreviation(eventDate);
      return (
        <Text>{month} {day}</Text>
      );
    }
  };

  // used for date comparisons
  const getDateStr = (date: Date) => new Date(date).toISOString().split('T')[0];

  const handleDatePress = (dateString: string) => {
    setSelectedDate(dateString);

    const index = registeredEvents.findIndex(
        (event) => getDateStr(new Date(event.date)) === dateString
    );

    if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true,});
    }
  };

  const weekRange = getWeekRange();

  return (
    <View style={styles.container} >
        <View style={styles.weekScroll}>
            <Text style={styles.icon}>{'<'}</Text>
            <Text style={styles.weekRange}>{weekRange.first} - {weekRange.last}</Text>
            <Text style={styles.icon}>{'>'}</Text>
        </View>
        <FlatList
            horizontal
            data={getWeek()}
            keyExtractor={(item) => item.toISOString()}
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
                console.log('Rendering event: ', registeredEvents);
                console.log('item', item);
                return (
                    <TouchableOpacity
                        key={item._id}
                        style={styles.eventCard}
                        onPress={() => router.push({ pathname: '/events/[id]', params: { id: item._id } })}
                    >
                        <View style={styles.eventImage}>
                            <Image 
                                source={{ uri: 'https://unitedway-uploads.s3.us-east-2.amazonaws.com/events/67bd5e928e73b7d338d2e1c8/1744350281645-bp_logo.jpg'}}
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

    // last tapped day -- indicates which day in calendar is highlighted
    // const [selectedDate, setSelectedDate] = useState<string>("");
    // const handleDatePress = ( dateString : string ) => {
    //     setSelectedDate(dateString);
        
    // }

    // return(
    //     <FlatList
    //         data={getWeek()}
    //         horizontal
    //         renderItem={ ({ item }) => {
    //             const dateString = item.toISOString().split("T")[0];
    //             const isSelected = selectedDate === dateString;

    //             return (
    //                 <TouchableOpacity onPress = {() => handleDatePress(dateString)}
    //             )
    //         }}>

    //     </FlatList>
    // );
