import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import axios, { AxiosResponse } from "axios";
// import { Picker } from '@react-native-picker/picker';

export default function OnboardingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params;
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    // const [gender, setGender] = useState(false);
    const [ethnicity, setEthnicity] = useState('');
    const [community, setCommunity] = useState('');

    const handleEditUser = async () => {
        try {
            const response: AxiosResponse = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${id}`,
                {
                    name: name,
                    phoneNumber: phone,
                    demographics: {
                        ethnicity: ethnicity,
                        community: community
                    }
                }
            );
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
            {/* <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
            >
                <Picker.Item label="Male" value={false} />
                <Picker.Item label="Female" value={true} />
            </Picker> */}
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
            <TouchableOpacity onPress={handleEditUser}>
                <Text>
                Done
                </Text>
            </TouchableOpacity>
        </View>
        {/* Super special dev button */}
        <Link href="/(tabs)" style={styles.footer}>
            Skip this and go home
        </Link>
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
  },
  footer: {
    padding: 24,
  }
});