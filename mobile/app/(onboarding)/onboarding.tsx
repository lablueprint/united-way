import { StyleSheet, View, Text, TextInput, TouchableOpacity, Button } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import DropDownPicker from 'react-native-dropdown-picker';

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, authToken, verificationMethod } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [community, setCommunity] = useState('');
  // Gender selector
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState(null);
  const [items, setItems] = useState([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ]);

  const [title, setTitle] = useState("What is your name?");
  const [subtitle, setSubtitle] = useState("Please enter your first and last name");
  const [placeholder, setPlaceholder] = useState("Name");
  const [textInput, setTextInput] = useState("");
  const [dropDownInput, setDropDownInput] = useState(null);
  const [state, setState] = useState(
    verificationMethod === 'sms' ? 2 : 1
  );
  
  

  const handleEditUser = async () => {
    try {
      const response: AxiosResponse = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${id}`,
        {
          name: name,
          phoneNumber: phone,
          demographics: {
            ethnicity: ethnicity,
            community: community,
            gender: gender
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': "application/json"
          }
        }
      );
      // Navigate to home screen
      router.push({ pathname: "/interest" })
      //router.push("/(tabs)");
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {

    if (state == 1) {
      setTitle("Phone Number");
      setName(textInput)

      setSubtitle("Enter your number to receive updates");
      setPlaceholder(phone || "Phone Number");
      setTextInput(phone);
    } else if (state == 2) {
      setTitle("What is your name?");

      setSubtitle("Please enter your first and last name");
      setPlaceholder(name || "Name");
      setTextInput(name);
    } else if (state == 3) {
      setTitle("Language");

      setPhone(textInput)
      setSubtitle("Enter your Preferred Language");
      setPlaceholder(ethnicity || "Language");
      setTextInput(ethnicity);
    } else if (state == 4) {
      setTitle("Community");
      setEthnicity(textInput)

      setSubtitle("Enter your Community");
      setPlaceholder(community || "Community");
      setTextInput(community);
    } else if (state == 5) {
      setTitle("Gender");
      setCommunity(textInput)
      setSubtitle("Enter your Gender");
      setPlaceholder(gender || "Please select");
      setTextInput("");
    } else if (state == 6) {
      setGender(dropDownInput)
      handleEditUser()
    }
  }, [state]); // Runs when `state` changes

  const handleContinue1 = async () => {
    setState(state => state + 1);
  }

  const handleBack = async () => {
    if (state > 1) {
      setState(state => state - 1); // Decrease the state first
    }

  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {state != 6 ?
          (<View style={styles.content}>
            {state != 1 ?
              (<TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>&lt; Back</Text>
              </TouchableOpacity>) : <></>}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                {subtitle}
              </Text>
            </View>
            {state != 5
              ? (<TextInput
                style={styles.input}
                value={textInput}
                onChangeText={setTextInput}
                placeholder={placeholder} />)
              : (<DropDownPicker
                open={open}
                value={gender}
                items={items}
                setOpen={setOpen}
                setValue={setGender}
                setItems={setItems}
                placeholder="Gender"
              />)}


            <TouchableOpacity style={styles.continueButton} onPress={handleContinue1}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
            <Text style={styles.textdd}>
              Let's get you onboarded!
            </Text>
          </View>) : <Text>Loading...</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  formContainer: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  textdd: {
    color: 'black',
    margin: 24,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 24,
    letterSpacing: 1,
  },
  continueButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {

  },
  backButtonText: {
    color: 'black',
    fontSize: 16,
    marginVertical: 10,
  }
});
