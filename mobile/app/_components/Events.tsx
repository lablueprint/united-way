import React,{useEffect, useState} from 'react';
import { View, Button, Text, StyleSheet} from 'react-native';
import axios, { AxiosResponse } from 'axios';

const styles = StyleSheet.create({
    titletext: {
    fontSize: 40,
    paddingTop: 50,
    paddingLeft: '8%',
    color: "white",
  },

  eventsTitle: {
    fontSize: 20,
    paddingTop: 5,
    paddingLeft: '8%',
    color: "white",
  },

  eventsDate: {
    fontSize: 15,
    paddingTop: 5,
    paddingLeft: '8%',
    color: "white",
  }
});

export default function Events() {

  const [allEvents, setAllEvents] = useState([])

  const getEvents = async () => {
    console.log("hi caroline");
    try {
      const events: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/events/`)
      const {data} = events.data
      return data
    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
  
    const fetchEvents  = async () => {
      const data = await getEvents();
      setAllEvents(data)
    }; 
    
    fetchEvents();
        
    console.log("hi angela")

    }, []);

    const fetchEvents  = async () => {
      const data = await getEvents();
      setAllEvents(data)
    }; 

    // console.log(allEvents[0])
    return (
      <View>
        <Text style={styles.titletext}>Events</Text>


        {
          allEvents.length !== 0 ?
          allEvents.map((events) => {
            console.log(typeof events)
            console.log(events)
            return(
              <View>
                <Text style={styles.eventsTitle}> {events.name} </Text>
              <Text style={styles.eventsDate}>{events.date}</Text>
              </View>
            )
          }) :
          <></>
        }

      </View>
    );

  }
