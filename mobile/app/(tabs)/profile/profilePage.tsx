import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";
import { View, Text, Image, Button , TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

interface UserDetails {
    name: string,
    phoneNumber: string,
    email: string,
    password: string,
    profilePicture: string,
    dateJoined: string,
}

export default function UserPage() {
    const [userDetails, setUserDetails] = useState<UserDetails>({name: "Subaru", phoneNumber: "", email: "", password: "", profilePicture: "", dateJoined: ""});
    const router = useRouter();

    const user = useSelector((state) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })

    const fetchUserDetails = async () => {
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`,
            {
                headers: {
                      'Authorization': `Bearer ${user.authToken}`,
                    },
            }
        );
            const { data } = response.data;
            setUserDetails(data);
        } catch (err) {
            console.log('Error catching event details from event id:', err);
            return err;
        }
    }
    useFocusEffect (() => {
        fetchUserDetails();
    });

    console.log(user.authToken);

    const navigateTo = (route: string) => {
        if (userDetails) {
            const userDetailsString = JSON.stringify(userDetails);
            const encodedDetails = encodeURIComponent(userDetailsString);
            router.push(`${route}?details=${encodedDetails}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.curveContainer}>
                <View style={styles.curve} />
            </View>
            <Text style={styles.title}>Profile</Text>
            <Image
                source={{uri: userDetails.profilePicture}}
                style={styles.profilePicture}
            />
            <Text style={styles.title}>{userDetails.name}</Text>
            <Text style={styles.header1}>{"Member since"}</Text>
            <Text style={styles.header2}>{userDetails.dateJoined.split('T')[0]}</Text>
            <View style={styles.gridContainer}>
                {/* My Account Block */}
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => navigateTo('/profile/editing')}
                >
                    <Image source={{uri: "https://static.thenounproject.com/png/4188546-200.png" }} style={styles.icon} />
                    <Text style={styles.blockText}>My Account</Text>
                    <Text style={styles.blockHeading}>Lets Personalize!</Text>
                </TouchableOpacity>

                {/* English or Español Block */}
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => console.log('Language selection pressed')}
                >
                    <Image source={{uri: "https://cdn-icons-png.flaticon.com/512/546/546310.png" }} style={styles.icon} />
                    <Text style={styles.blockText}>Language</Text>
                    <Text style={styles.blockHeading}>English or Espanol</Text>
                </TouchableOpacity>

                {/* Passport Block */}
                <TouchableOpacity
                    style={styles.block}
                >
                    <Image source={{uri: "https://cdn-icons-png.flaticon.com/512/3596/3596115.png" }} style={styles.icon} />
                    <Text style={styles.blockText}>Privacy</Text>
                    <Text style={styles.blockHeading}>Protect your information!</Text>
                </TouchableOpacity>

                {/* Passport Block (Duplicate) */}
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => navigateTo('/profile/passport')}
                >
                    <Image source={{uri: "https://static.thenounproject.com/png/1689194-200.png" }} style={styles.icon} />
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
        backgroundColor: '#A9A9A9',
    },
    curveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 510, // Height of the curved section
        overflow: 'hidden', // Ensures the curve doesn't overflow
    },
    curve: {
        backgroundColor: '#FFFFFF', // Grey color for the curve
        height: 600, // Double the height to create a smooth curve
        borderRadius: 300, // Half of the height to create a circular curve
        transform: [{ scaleX: 2 }], // Stretch horizontally to create a smooth curve
    },
    profilePicture: {
        width: 150, // Size of the profile picture
        height: 150, // Size of the profile picture
        borderRadius: 75, // Half of the width/height to make it circular
        marginBottom: 1, // Spacing below the profile picture
        borderWidth: 3, // Optional: Add a border
        borderColor: '#000000', // Optional: Border color
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    header1: {
        fontSize: 12,
        marginBottom: 1,
    },
    header2: {
        fontSize: 12,
        marginBottom: 10,
    },
    icon: {
        width: 50, // Adjust the size of the icon as needed
        height: 50, // Adjust the size of the icon as needed
        marginBottom: 10, // Spacing between the icon and the text
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
        color: '#000000', // Text color
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    blockHeading: {
        color: '#000000', // Text color
        fontSize: 10,
        textAlign: 'center',
    },
});