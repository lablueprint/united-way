import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import axios, { AxiosResponse } from "axios";
import DropDownPicker from 'react-native-dropdown-picker';

export default function OnboardingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, authToken } = params;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [community, setCommunity] = useState('');
    // Gender selector
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState(null);
    const [items, setItems] = useState([
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Other', value: 'other'},
    ]);

    const handleEditUser = async () => {
        console.log(gender);
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
            router.push("/(tabs)");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <View style={styles.containerdd}>
        <View style={styles.contentdd}>
            <Text style={styles.textdd}>
                Let's get you onboarded!
            </Text>
            <Text style={styles.subtitle}>Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={setName}
                value={name}
            />
            <Text style={styles.subtitle}>Phone</Text>
            <TextInput
                style={styles.input}
                placeholder="Phone"
                onChangeText={setPhone}
                value={phone}
            />
            <Text style={styles.subtitle}>Ethnicity</Text>
            <TextInput
                style={styles.input}
                placeholder="Ethnicity"
                onChangeText={setEthnicity}
                value={ethnicity}
            />
            <Text style={styles.subtitle}>Community</Text>
            <TextInput
                style={styles.input}
                placeholder="Community"
                onChangeText={setCommunity}
                value={community}
            />
            <DropDownPicker
                open={open}
                value={gender}
                items={items}
                setOpen={setOpen}
                setValue={setGender}
                setItems={setItems}
                placeholder={'Gender'}
            />
            <TouchableOpacity onPress={handleEditUser} style = {styles.continueButton}>
                <Text style = {styles.continueButtonText}>
                Done
                </Text>
            </TouchableOpacity>
            {/* Super special dev button */}
            {/* <Link href="/(tabs)" style={styles.text}>
                Skip this and go home
            </Link> */}
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
  containerdd: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentdd: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textdd: {
    color: 'black',
    margin: 24,
  },
    outerContainer: {
      flex: 1,
      padding: 2,
      backgroundColor: '#007AFF',
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
  });
