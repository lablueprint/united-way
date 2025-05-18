"use client"
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, Image, Animated, Easing, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';

interface UserDetails {
  name: string,
  phoneNumber: string,
  email: string,
  password: string,
  profilePicture: string,
  dateJoined: string,
  demographics: {
    community: string,
  }
  collectedStamps: string[],
}

export default function ProfileEditor() {
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: "", phoneNumber: "", email: "", password: "", profilePicture: "", dateJoined: "", demographics: { community: "" }, collectedStamps: [], });
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [community, setCommunity] = useState("");
  const [collectedStamps, setCollectedStamps] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const [user, sendRequest] = useApiAuth();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '180deg'],
  });

  const navigateToProfile = () => {
    router.push('/profile/profilePage');
  }
  const fetchUserDetails = async () => {
    try {
      const body = {};
      const requestType = RequestType.GET;
      const endpoint = "users/:id";
      const data = await sendRequest({ body, requestType, endpoint });
      setUserDetails(data);
      setCollectedStamps(data.collectedStamps || []);

    } catch (err) {
      console.log('Error catching event details from event id:', err);
      return err;
    }
  }

  const deletePic = async (voidPicture: string) => {
    try {
      const body = { profilePicture: voidPicture };
      const endpoint = "user/:id";
      const requestType = RequestType.PATCH;
      await sendRequest({ body, endpoint, requestType });
    } catch (err) {
      console.error('Error deleting PFP:', err);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchUserDetails();
  }, []));

  const handleSubmit = async () => {
    try {
      interface UserUpdate {
        name?: string;
        phoneNumber?: string;
        email?: string;
        password?: string;
        demographics?: {
          community: string;
        };
      }
      const updateData: UserUpdate = {};

      if (name.trim() !== '') updateData.name = name;
      if (phoneNumber.trim() !== '') updateData.phoneNumber = phoneNumber;
      if (email.trim() !== '') updateData.email = email;
      if (password.trim() !== '') updateData.password = password;

      if (community.trim() !== '') {
        updateData.demographics = {
          community: community
        };
      }

      if (Object.keys(updateData).length > 0) {
        const endpoint = "users/:id";
        const requestType = RequestType.PATCH;
        const body = updateData;
        await sendRequest({ endpoint, requestType, body });

        fetchUserDetails();
      } else {
        console.log('No changes to update');
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteStamp = (stampToDelete: string) => {
    Alert.alert(
      "Delete Stamp",
      "Are you sure you want to remove this stamp?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const updatedStamps = collectedStamps.filter(stamp => stamp !== stampToDelete);
              setCollectedStamps(updatedStamps);

              // Then send to server
              const body = {
                collectedStamps: updatedStamps
              };
              const endpoint = "users/:id";
              const requestType = RequestType.PATCH;
              await sendRequest({ body, endpoint, requestType });
            } catch (err) {
              console.error('Error deleting stamp:', err);
            }
          },
          style: "destructive"
        }
      ]
    );
  };


  const navigateTo = (route: string) => {
    router.push(`${route}`);
  }

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.backButton} onPress={navigateToProfile}>
        <Image source={{}}></Image>
      </TouchableOpacity> */}
      <View style={styles.topContainer}>
        <Text style={styles.header}>Account</Text>

        {/* Basic information */}
        <View>
          <Text style={styles.basicHeader}>
            BASIC INFORMATION
          </Text>
          <View style={styles.formContainer}>
            <Text style={styles.label}>
              FIRST NAME
            </Text>
            <TextInput
              style={styles.input}
              placeholder={userDetails.name}
              onChangeText={(text) => { setName(text) }}
              value={name}
            />
            <Text style={styles.label}>    Phone Number:</Text>
            <TextInput
              style={styles.input}
              placeholder={userDetails.phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              value={phoneNumber}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>    Email:</Text>
            <TextInput
              style={styles.input}
              placeholder={userDetails.email}
              onChangeText={(text) => setEmail(text)}
              value={email}
              keyboardType="email-address"
            />
            <Text style={styles.label}>    Password:</Text>
            <TextInput
              style={styles.input}
              placeholder={"************"}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry
            />
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={styles.expandHeader}
            onPress={toggleExpand}
          >
            <Text style={styles.expandHeaderText}>Advanced</Text>
            <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
              <AntDesign name="up" size={20} color="#666666" />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: '100%',
    flexWrap: "wrap",
    backgroundColor: '#FFFFFF', // Light gray background
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333', // Primary color
    textAlign: 'center',
  },
  profilePicture: {
    width: 100, // Size of the profile picture
    height: 100, // Size of the profile picture
    borderRadius: 75, // Half of the width/height to make it circular
    marginBottom: 10, // Spacing below the profile picture
    borderWidth: 3, // Optional: Add a border
    borderColor: '#A9A9A9', // Optional: Border color
    justifyContent: 'center',
  },
  pictureButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: "wrap",
    height: '90%',
    marginBottom: 0,
  },
  basicHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
  },
  formContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: '#FFFFFF', // White background for the form
    borderRadius: 5,
    padding: 5,
  },
  label: {
    width: "50%",
    fontSize: 13,
    textAlign: 'left',
    color: '#333333', // Dark gray text
    marginBottom: 5,
  },
  input: {
    width: "50%",
    height: 30,
    borderColor: '#CCCCCC', // Light gray border
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 5,
    marginBottom: 7,
    backgroundColor: '#FAFAFA', // Light gray background for inputs
  },
  buttonContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: '10%',
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#6C757D', // Primary color
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  backButton: {
    backgroundColor: '#CCCCCC', // Gray color for the back button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF', // White text
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 5,
    padding: 5,
  },
  changeBlock: {
    width: 100, // Each block takes up 48% of the container width
    height: 20,
    borderBlockColor: '#',
    // aspectRatio: 1, // Makes the blocks square
    marginBottom: 5, // Adds spacing between rows
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10, // Rounded corners
    // padding: 5, // Padding inside the block
  },
  deleteBlock: {
    width: 100,
    height: 20,
    backgroundColor: '#A9A9A9', // Background color for the block
    borderRadius: 10, // Rounded corners
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePicture: {
    color: '#A9A9A9', // Text color
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deletePicture: {
    color: '#FFFFFF', // Text color
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  expandHeader: {
    flexDirection: 'row',
    width: "100%",
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  expandHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: "left",
    color: '#333333',

  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Reduced from 12
    padding: 8, // Reduced from 12
  },
  stampBlock: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15, // Reduced from 8
    padding: 8, // Reduced from 12
    paddingRight: 24, // Reduced from 32
    minWidth: 80, // Reduced from 100
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stampText: {
    fontSize: 12, // Reduced from 14
    color: '#666666',
    fontWeight: 'bold',
  },
  deleteStampButton: {
    position: 'absolute',
    top: -6, // Reduced from -8
    right: -6, // Reduced from -8
    backgroundColor: '#f5f5f5',
    width: 18, // Reduced from 24
    height: 18, // Reduced from 24
    borderRadius: 9, // Half of width/height
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1, // Reduced from 2
    },
    shadowOpacity: 0.2, // Reduced from 0.25
    shadowRadius: 2, // Reduced from 3.84
    elevation: 3, // Reduced from 5
  },
  deleteIcon: {
    fontSize: 10, // Reduced from 12
    color: '#000000', // Changed to white for better contrast
    lineHeight: 12, // Reduced from 14
    textAlign: 'center',
    fontWeight: 'bold', // Added for better visibility
  },
});