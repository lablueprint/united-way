import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { View, Text, Image, Button , TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';

interface UserDetails {
    name: string,
    phoneNumber: string,
    email: string,
    password: string,
    profilePicture: string,
}

export default function UserPage() {
    const [userDetails, setUserDetails] = useState<UserDetails>({name: "", phoneNumber: "", email: "", password: "", profilePicture: ""});
    const router = useRouter();

    const user = useSelector((state) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    const fetchUserDetails = async () => {
        console.log(user.authToken);
        try {
            console.log(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`)
            const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`,
            {
                headers: {
                      'Authorization': `Bearer ${user.authToken}`,
                    },
            }
        );
            const { data } = response.data;
            console.log( data );
            setUserDetails(data);
        } catch (err) {
            console.log('Error catching event details from event id:', err);
            return err;
        }
    }

    useEffect (() => {
        fetchUserDetails();
    }, []);

    const navigateTo = (route: string) => {
        if (userDetails) {
            const userDetailsString = JSON.stringify(userDetails);
            const encodedDetails = encodeURIComponent(userDetailsString);
            router.push(`${route}?details=${encodedDetails}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Image
                source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtkMqOpMkcZwttYv-z-Rxh6u0zRMPEk5_VVg&s"}}
                style={styles.profilePicture}
            />
            <Text style={styles.title}>Subaru</Text>
            <View style={styles.gridContainer}>
                {/* My Account Block */}
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => navigateTo('/profile/editing')}
                >
                    <Text style={styles.blockText}>My Account</Text>
                    <Text style={styles.blockHeading}>Lets Personalize!</Text>
                </TouchableOpacity>

                {/* English or Español Block */}
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => console.log('Language selection pressed')}
                >
                    <Text style={styles.blockText}>Language</Text>
                    <Text style={styles.blockHeading}>English or Espanol</Text>
                </TouchableOpacity>

                {/* Passport Block */}
                <TouchableOpacity
                    style={styles.block}
                >
                    <Text style={styles.blockText}>Privacy</Text>
                    <Text style={styles.blockHeading}>Protect your information!</Text>
                </TouchableOpacity>

                {/* Passport Block (Duplicate) */}
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => navigateTo('/profile/passport')}
                >
                    <Text style={styles.blockText}>Passport</Text>
                    <Text style={styles.blockHeading}>See your past events!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture: {
        width: 150, // Size of the profile picture
        height: 150, // Size of the profile picture
        borderRadius: 75, // Half of the width/height to make it circular
        marginBottom: 20, // Spacing below the profile picture
        borderWidth: 3, // Optional: Add a border
        borderColor: '#A9A9A9', // Optional: Border color
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    block: {
        width: '48%', // Each block takes up 48% of the container width
        aspectRatio: 1, // Makes the blocks square
        marginBottom: 10, // Adds spacing between rows
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#A9A9A9', // Background color for the block
        borderRadius: 10, // Rounded corners
        padding: 10, // Padding inside the block
    },
    blockText: {
        color: '#FFFFFF', // Text color
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    blockHeading: {
        color: '#FFFFFF', // Text color
        fontSize: 10,
        textAlign: 'center',
    },
});