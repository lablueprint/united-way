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
        <View style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.text}>
                Let's get you onboarded!
            </Text>
            <TextInput
                placeholder="Name"
                onChangeText={setName}
                value={name}
            />
            <TextInput
                placeholder="Phone"
                onChangeText={setPhone}
                value={phone}
            />
            <TextInput
                placeholder="Ethnicity"
                onChangeText={setEthnicity}
                value={ethnicity}
            />
            <TextInput
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
            <TouchableOpacity onPress={handleEditUser}>
                <Text>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'black',
    margin: 24,
  }
});