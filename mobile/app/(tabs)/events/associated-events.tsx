import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useSelector } from 'react-redux';

// takes event data passed and populates list of events
export default function associatedEvents() {
  const { id } = useLocalSearchParams();
  const org = useSelector((state) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

  console.log('inassociated', id);
  console.log('token', org.authToken);
  const [associatedEvents, setAssociatedEvents] = useState([]);
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
        const { data } = response.data;
        setAssociatedEvents(data);
        console.log('orgs events',data);
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

    return(
        <View>
          <Text>List of events that is from an organization</Text>
          <Text>{associatedEvents}</Text>
        </View>
    )
}