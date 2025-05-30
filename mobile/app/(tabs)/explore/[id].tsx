import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

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
  // activities: Activity[];
}



export default function EventDetails() {
  // Temporary Duration
  const duration = 3;
  // TODO: Replace static address with reverse geocoded location
  const staticAddress = "330 De Neve Drive";

  const router = useRouter();
  const [eventData, setEventData] = useState<EventData>({
    organizerID: "",
    _id: "",
    name: "",
    date: new Date(),
    description: "",
    location: {
      type: "",
      coordinates: [],
    },
    tags: [],
    registeredUsers: [],
  });

  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [organizationName, setOrganizationName] = useState("");

  const { id } = useLocalSearchParams();

  const [user, sendRequest] = useApiAuth();

  const getEventDetails = async () => {
    try {
      const body = {};
      const endpoint = `events/${id}`
      const requestType = RequestType.GET;
      const data = await sendRequest({ requestType, endpoint, body });
      setEventData({
        ...data,
        date: new Date(data.date)
      });
      setRegisteredUsers(data.registeredUsers);
    } catch (err) {
      console.error(err);
    }
  }

  useFocusEffect(
    useCallback(() => { getEventDetails(); }, [id])
  );

  useEffect(() => {
    if (eventData) {
      setRegisteredUsers(eventData.registeredUsers);
    }
  }, [eventData]);

  if (!id) {
    return <Text>No event details found.</Text>;
  }

  const addEventToUser = async (eventId: string) => {
    try {
      const body = {
        newEvent: eventId,
      };
      const endpoint = `users/:id/addEvent`;
      const requestType = RequestType.PATCH;
      await sendRequest({ requestType, endpoint, body });
    } catch (err) {
      console.error(err);
    }
  }

  const addUserToEvent = async (userId: string) => {
    try {
      const body = {
        newUser: userId,
      };
      const endpoint = `events/${eventData._id}/addUser`;
      const requestType = RequestType.PATCH;
      await sendRequest({ requestType, endpoint, body });
    } catch (err) {
      console.error(err);
    }

  };

  const removeUserFromEvent = async (userId: string) => {
    try {
      const body = {
        userId: userId,
      };
      const endpoint = `events/${eventData._id}/removeUser`;
      const requestType = RequestType.PATCH;
      await sendRequest({ requestType, endpoint, body });
    } catch (err) {
      console.error(err);
    }
  }

  const removeEventFromUser = async (eventId: string) => {
    try {
      const body = {
        eventId: eventId,
      };
      const endpoint = "users/:id/removeEvent";
      const requestType = RequestType.PATCH;
      await sendRequest({ requestType, endpoint, body });
    } catch (err) {
      console.error(err);
    }
  }

  const handleRegister = async () => {
    try {
      await addEventToUser(eventData._id);
      await addUserToEvent(user.userId);

      setRegisteredUsers([...registeredUsers, user.userId]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnregister = async () => {
    try {
      await removeEventFromUser(eventData._id);
      await removeUserFromEvent(user.userId);

      setRegisteredUsers(registeredUsers.filter(id => id !== user.userId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const getOrganizationName = async () => {
      try {
        if (!eventData.organizerID) return;

        const requestType = RequestType.POST;
        const endpoint = "orgs/filtered";
        const body = {
          _id: eventData.organizerID,
        };
        const data = await sendRequest({ requestType, endpoint, body })
        const orgName = data[0]?.name;
        setOrganizationName(orgName || 'Unknown Organization');
      } catch (err) {
        console.error(err);
      }
    };
    getOrganizationName();
  }, [eventData.organizerID]);

  const getMonthAbbreviation = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imgContain}>
        <View style={styles.iconContain}>
          <View><TouchableOpacity onPress={() => {
            router.push({ pathname: "/explore" });
          }
          }><Text>back</Text></TouchableOpacity></View>
          <View><Text>share</Text></View>
        </View>
        <View>
          <Text style={styles.title}>{eventData.name}</Text>
          <View style={styles.pillContain}>
            <View style={styles.infoPill}>
              <View><Text>x</Text></View>
              <Text style={styles.pillText}>{eventData.date.getDate()} | {getMonthAbbreviation(eventData.date)}</Text>
            </View>
            <View style={styles.infoPill}>
              {/* <View><Text>x</Text></View> */}
              <Text style={styles.pillText}>{duration} hours</Text>
            </View>
            <View style={styles.infoPill}>
              <View><Text>o</Text></View>
              <Text style={styles.pillText}>{staticAddress}</Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} >
        <View>
          <Text>Hosted By</Text>
          <View style={styles.rowFlex}>
            <View style={styles.orgContainer}>
              <Text style={styles.organizer}>{organizationName}</Text>
              <View style={styles.buttonWrap}>
                <TouchableOpacity style={styles.infoPill}
                  onPress={() => {
                    router.push({
                      pathname: `/explore/associated-events`,
                      params:
                      {
                        id: eventData.organizerID,
                        exclude: eventData._id,
                      },
                    });
                  }}
                >
                  <Text style={styles.pillText}>More</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* conditionally displayed based on registered status */}
            {(registeredUsers).includes(user.userId) ?
              <></>
              :
              <View style={styles.rowFlex}>
                <TouchableOpacity style={styles.orgButton}><Text>x</Text></TouchableOpacity>
                <TouchableOpacity style={styles.orgButton}><Text>x</Text></TouchableOpacity>
              </View>
            }
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Description</Text>
          <Text style={styles.description}>{eventData.description}</Text>
          {(registeredUsers).includes(user.userId) ?
            <TouchableOpacity onPress={handleUnregister}>
              <Text style={styles.darkButton}>Cancel</Text>
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.darkButton}>RSVP</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Rewards</Text>
          <View style={styles.rewardsContain}>
            <Text style={styles.reward}>Reward Component Placeholder</Text>
            <Text style={styles.reward}>Reward Component Placeholder</Text>
            <Text style={styles.reward}>Reward Component Placeholder</Text>
          </View>
        </View>
        {(registeredUsers).includes(user.userId) ?
          <View style={styles.section}>
            <Text style={styles.subheader}>Raffle</Text>
            <View style={styles.raffleContain}>
              <Text style={styles.reward}>Pic of Gift</Text>
              <View style={styles.giftInfo}>
                <Text style={styles.giftTitle}>Title of Gift</Text>
                <Text style={styles.description}>Raffle Gift Details</Text>
              </View>
            </View>
            <TouchableOpacity><Text style={styles.darkButton}>Join</Text></TouchableOpacity>
          </View>
          :
          <></>
        }

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 64,
    padding: 16,
    gap: 12,
  },
  scroll: {
    gap: 12,
    paddingBottom: 64,
  },
  section: {
    marginTop: 14,
    gap: 4,
  },
  orgContainer: {
    backgroundColor: '#9d9d9d',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  imgContain: {
    backgroundColor: '#D3D3D3',
    width: '100%',
    height: 280,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  iconContain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillContain: {
    flexDirection: 'row',
    gap: 8,
  },
  rowFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  darkButton: {
    width: '100%',
    backgroundColor: '#3b3b3b',
    fontWeight: 700,
    borderRadius: 6,
    color: 'white',
    textAlign: 'center',
    paddingVertical: 12,
    marginTop: 14,
  },
  infoPill: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 8,
    alignItems: 'center'
  },
  orgButton: {
    borderRadius: 100,
    backgroundColor: '#9d9d9d',
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
  subheader: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  organizer: {
    fontSize: 18,
    fontWeight: 500,
  },
  rewardsContain: {
    height: 100,
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#cecece',
    flexDirection: 'row',
    gap: 8,
  },
  reward: {
    flex: 1,
    textAlign: 'center',
    backgroundColor: '#bbbbbb',
  },
  raffleContain: {
    flexDirection: 'row',
    gap: 12,
    height: 60,
  },
  giftTitle: {
    fontSize: 14,
  },
  giftInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  buttonWrap: {
    flexShrink: 0,
  }
});