import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Touchable, Button, ScrollView, Pressable} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface EventDetails {
  id: string;
  name: string;
  description: string;
  org: string;
}

export default function EventPage() {
  // Retrieve the 'details' query parameter from the URL
  // const { details } = useLocalSearchParams()
  const details = {
    id: '67908ee7339ea31330c3ce15',
    name: 'Health & Wellness Fair',
    description: 'A fair promoting health, wellness, and sustainable living.',
    org: 'LA Blueprint',
  }

  // Check if the details exist and parse them
  if (!details) {
    return <Text>No event details found.</Text>;
  }

  // Decode and parse the event details
  // const parsedEventDetails = JSON.parse(decodeURIComponent(details as string)) as EventDetails;
  const parsedEventDetails = details;

  return (
    <View style={styles.container}>
      <View style={styles.imgContain}>
        <View style={styles.iconContain}>
          <View><Text>back</Text></View>
          <View><Text>share</Text></View>
        </View>
        <View>
        <Text style={styles.title}>{parsedEventDetails.name}</Text>
          <View style={styles.pillContain}> 
            <View style={styles.infoPill}>
              <View><Text>x</Text></View>
              <Text style={styles.pillText}>9 Jan | 5 PM</Text>
            </View>
            <View style={styles.infoPill}>
              {/* <View><Text>x</Text></View> */}
              <Text style={styles.pillText}>3 hours</Text>
            </View>
            <View style={styles.infoPill}>
              <View><Text>o</Text></View>
              <Text style={styles.pillText}>330 De Neve Drive</Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} >
        <View>
          <Text>Hosted By</Text>
          <View style={styles.rowFlex}>
            <View style={styles.orgContainer}>
              <Text style={styles.organizer}>{parsedEventDetails.org}</Text>
              <TouchableOpacity style={styles.infoPill}><Text style={styles.pillText}>More</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.orgButton}><Text>x</Text></TouchableOpacity>
            <TouchableOpacity style={styles.orgButton}><Text>x</Text></TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Description</Text>
          <Text style={styles.description}>{parsedEventDetails.description}</Text>
          <TouchableOpacity><Text style={styles.darkButton}>RSVP</Text></TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Rewards</Text>
          <View style={styles.rewardsContain}>
            <Text style={styles.reward}>Reward Component Placeholder</Text>
            <Text style={styles.reward}>Reward Component Placeholder</Text>
            <Text style={styles.reward}>Reward Component Placeholder</Text>
          </View>
        </View>
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
      </ScrollView>
      {/* <Text style={styles.description}>{parsedEventDetails.description}</Text> */}
      {/* <Text style={styles.organizer}>Organized by: {parsedEventDetails.org}</Text> */}
    </View>
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
  scroll: {
    // flex: 1,
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
    // marginVertical: 8,
  },
  subheader: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  organizer: {
    fontSize: 18,
    fontWeight: 500,
    // marginVertical: 8,
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
  }
});