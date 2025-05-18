"use client"
import React, { useState, useRef, useCallback } from 'react';
import { SafeAreaView, View, Text, TextInput, Image, Animated, Easing, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import useApiAuth from '@/app/_hooks/useApiAuth';
import { RequestType } from '@/app/_interfaces/RequestInterfaces';

import { Color, Typography } from '@/app/_styles/global';

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


// TODO: Interests section (requires saving interests from onboarding first)
//       Setting location  (requires saving location from onboarding first)
//       Changing email flow
export default function Account() {
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

  const fetchUserDetails = async () => {
    try {
      const body = {};
      const requestType = RequestType.GET;
      const endpoint = "users/:id";
      const data = await sendRequest({ body, requestType, endpoint });
      setUserDetails(data);
      setName(data.name);
      setPassword(data.password);
      setEmail(data.email);
      setCommunity(data.community || "");
      setCollectedStamps(data.collectedStamps || []);

    } catch (err) {
      console.log('Error catching event details from event id:', err);
      return err;
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
      if (email.trim() !== '') updateData.email = email;
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backContainer} onPress={() => { router.back(); }}>
          <Image source={require("../../../assets/images/profile/arrowLeft.png")} style={styles.arrowLeft} />
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.headerText]}>MY ACCOUNT</Text>
      </View>

      <View style={styles.innerContainer}>
        {/* Basic information */}
        <View style={styles.form}>
          <Text style={[Typography.h3, styles.basicHeader]}>
            BASIC INFORMATION
          </Text>
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Text style={[Typography.body2, styles.label]}>
                NAME
              </Text>
              <TextInput
                style={styles.input}
                placeholder={"Name"}
                onChangeText={(text) => { setName(text) }}
                value={name}
                onEndEditing={handleSubmit}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={[Typography.body2, styles.label]}>
                E-MAIL
              </Text>
              <TextInput
                style={styles.input}
                placeholder={"Email"}
                onChangeText={(text) => setEmail(text)}
                value={email}
                keyboardType="email-address"
                onEndEditing={handleSubmit}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={[Typography.body2, styles.label]}>
                PASSWORD
              </Text>
              <TextInput
                style={styles.input}
                placeholder={"Password"}
                onChangeText={(text) => setPassword(text)}
                value={"Password"}
                secureTextEntry
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={[Typography.body2, styles.label]}>
                LOCATION
              </Text>
              <TextInput
                style={styles.input}
                placeholder={"Location"}
                onChangeText={(text) => setCommunity(text)}
                value={community}
                onEndEditing={handleSubmit}
              />
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.form}>
          <Text style={[Typography.h3, styles.basicHeader]}>
            INTERESTS
          </Text>
        </View>
      </View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: "100%",
    height: '100%',
    backgroundColor: "#FFFFFF",
    rowGap: 44
  },
  header: {
    marginHorizontal: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerText: {
    fontSize: 36,
    color: Color.uwDarkBlue, // Primary color
  },
  backContainer: {
    position: "absolute",
    left: 0,
  },
  arrowLeft: {
    width: 24, // Size of the picture
    height: 24, // Size of the picture
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: Color.uwDarkBlue,
    opacity: 0.2,
  },
  innerContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 20,
    marginHorizontal: 24,
  },
  fieldContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    rowGap: 4
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
    fontSize: 28,
    fontWeight: 'bold',
    color: Color.uwDarkBlue,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    rowGap: 20,
  },
  formContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: '#FFFFFF', // White background for the form
    borderRadius: 5,
    padding: 5,
    rowGap: 12
  },
  label: {
    fontSize: 13,
    marginBottom: 5,
    color: Color.uwDarkBlue,
    fontWeight: 700,
    opacity: 0.7
  },
  input: {
    width: "100%",
    color: Color.uwDarkBlue, // Light gray border
    borderRadius: 4,
    padding: 10,
    backgroundColor: "rgba(16, 22, 127, 0.08)", // Light gray background for inputs
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
});