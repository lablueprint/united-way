import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { io, Socket } from "socket.io-client";
import { useRef } from 'react';
import Poll from '../../_components/Poll';
import Announcement from '../../_components/Announcement';
import Raffle from '../../_components/Raffle';

const windowHeight = Dimensions.get('window').height;

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

  // Raffle states
  const [joinedRaffles, setJoinedRaffles] = useState(false);
  const [raffleNumber, setRaffleNumber] = useState<number | null>(null);
  const [drawnNumber, setDrawnNumber] = useState<number | null>(null);
  const [winner, setWinner] = useState<boolean | null>(null);
  const [raffleVisible, setRaffleVisible] = useState(false);

  // Poll states
  const [pollVisible, setPollVisible] = useState(false);
  const [pollId, setPollId] = useState<string | null>(null);
  const [pollResponses, setPollResponses] =  useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Announcement states
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [announcementId, setAnnouncementId] = useState<string | null>(null);
  const { id } = useLocalSearchParams();

  const [user, sendRequest] = useApiAuth();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if ((registeredUsers).includes(user.userId) && !socketRef.current) {
      socketRef.current = io(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}`);
      const socket = socketRef.current;
      // Send a message to the server
      socket.emit('message', `Connecting at ${new Date()}`);
      // Join the event room
      socket.emit('join event', eventData);
      listenForEventUpdates();
    }
  }, [registeredUsers]);

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
      setJoinedRaffles(false);
      setRaffleNumber(null);
      socketRef.current?.emit('leave event', eventData);
      socketRef.current?.disconnect();
      socketRef.current = null;
    } catch (err) {
      console.error(err);
    }
  };

  const closePoll = () => {
    setPollVisible(false);
  }

  const closeAnnouncement = () => {
    setAnnouncementVisible(false);
  }

  const closeRaffle = () => {
    setRaffleVisible(false);
  }

  const listenForEventUpdates = () => {
    const socket = socketRef.current;
    // Listen for messages from the server
    socket?.on('message', (data) => {
      console.log('Message from server:', data);
    });
    // Listen for event and activity updates
    socket?.on('event start', (data) => {
      console.log('Event started:', data.name);
      Alert.alert('Event started', `The event ${data.name} has started!`);
    });
    socket?.on('event end', (data) => {
      closePoll();
      closeAnnouncement();
      closeRaffle();
      console.log('Event ended:', data.name);
      Alert.alert('Event ended', `The event ${data.name} has ended!`);
    });
    socket?.on('announcement start', (id) => {
      console.log('Announcement starting');
      setAnnouncementVisible(true);
      setAnnouncementId(id);
    });
    socket?.on('announcement end', (id) => {
      console.log('Announcement ending');
      setAnnouncementVisible(false);
      setAnnouncementId(null);
    });
    socket?.on('poll', (id) => {
      console.log('Poll starting');
      setShowResults(false);
      setPollVisible(true);
      setPollId(id);
    });
    socket?.on('poll results', (id) => {
      setShowResults(true);
      setPollVisible(true);
      setPollId(id);
    })
    socket?.on('activity start', (data) => {
      console.log('Activity started:', data.type);
      Alert.alert('Activity started', `An activity of type ${data.type} has started.`);
    });
    socket?.on('activity end', (data) => {
      console.log('Activity ended:', data.type);
      Alert.alert('Activity ended', `An activity of type ${data.type} has ended.`);
    });
    // Listen for raffle updates
    socket?.on('new raffle number', (raffleNumber) => {
      console.log('New raffle number:', raffleNumber);
      setRaffleNumber(raffleNumber);
      setDrawnNumber(null);
      setWinner(null);
      setRaffleVisible(true);
    });
    socket?.on('raffle winner', (randomRaffleNumber) => {
      setDrawnNumber(randomRaffleNumber);
      setWinner(true);
      setRaffleVisible(true);
    });
    socket?.on('raffle loser', (randomRaffleNumber) => {
      setDrawnNumber(randomRaffleNumber);
      setWinner(false);
      setRaffleVisible(true);
    });
    // Listen for disconnection
    socket?.on('disconnect', () => {
      socketRef.current = null;
      console.log('Disconnected from server');
    });
  }

  const handleJoinRaffles = () => {
    if (!joinedRaffles && eventData && eventData.registeredUsers.includes(user.userId)) {
      setJoinedRaffles(true);
      socketRef.current?.emit('join raffle', eventData);
    }
  }

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
        {/* Poll modal */
        (registeredUsers).includes(user.userId) ?
          <Modal
            animationType="slide"
            transparent={true}
            visible={pollVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setPollVisible(!pollVisible);
            }}
          >
            <View style={styles.modalOverlay}>
              {pollId && socketRef.current && <Poll activityId={pollId} socket={socketRef.current} closePoll={closePoll} showResults={showResults} pollResponses={pollResponses} setPollResponses={setPollResponses}/>}
            </View>
          </Modal>
          :
          <></>
        }
        {/* Announcement modal */
        (registeredUsers).includes(user.userId) ?
          <Modal
            animationType="slide"
            transparent={true}
            visible={announcementVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setAnnouncementVisible(!announcementVisible);
            }}
          >
            <View style={styles.modalOverlay}>
              {announcementId && socketRef.current && <Announcement activityId={announcementId} closeAnnouncement={closeAnnouncement} />}
            </View>
          </Modal>
          :
          <></>
        }
        {/* Raffle modal */
        (registeredUsers).includes(user.userId) ?
          <Modal
            animationType="slide"
            transparent={true}
            visible={raffleVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setRaffleVisible(!raffleVisible);
            }}
          >
            <View style={styles.modalOverlay}>
              {socketRef.current && raffleNumber && <Raffle number={raffleNumber} drawnNumber={drawnNumber} winner={winner} closeRaffle={closeRaffle} />}
            </View>
          </Modal>
          :
          <></>
        }
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
            {!joinedRaffles &&
              <TouchableOpacity onPress={handleJoinRaffles}>
                <Text style={styles.darkButton}>Join</Text>
              </TouchableOpacity>
            }
            {joinedRaffles && raffleNumber &&
              <Text>Your raffle number is {raffleNumber}.</Text>
            }
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
  },
  modalOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    height: windowHeight,
  },
});