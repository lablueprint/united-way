"use client"
import React, { useState } from 'react';
import { View, Text, TextInput, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';

export default function EditUserDetails() {
    const user = useSelector((state) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    const [name, setName] = useState(user.userId.name);
    const [phoneNumber, setPhoneNumber] = useState(user.userId.phoneNumber);
    const [email, setEmail] = useState(user.userId.email);
    const [password, setPassword] = useState(user.userId.password)
    const router = useRouter();

    const navigateToProfile = () => {
        router.push(`/profile/profilePage`);
  }
    

    const handleSubmit = async () => {
      console.log(user.authToken);
        try {
            const response: AxiosResponse = await axios.patch(
              `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`, 
              {
                name: name,
                phoneNumber: phoneNumber,
                email: email,
                password: password,
              },
              {
                headers: {
                      'Authorization': `Bearer ${user.authToken}`,
                      'Content-Type': "application/json"
                    },
              }
            );
              // Store updated user details if necessary
            console.log('User updated successfully');
          } catch (err) {
            console.error('Error updating user:', err);
          }
    };

    const navigateTo = (route: string) => {
          router.push(`${route}`);
    }

        return (
            <View style={styles.container}>
                <Text style={styles.header}>Account</Text>
                <View style={styles.gridContainer}>
                <Image
                source={{uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtkMqOpMkcZwttYv-z-Rxh6u0zRMPEk5_VVg&s"}}
                style={styles.profilePicture}
            />
              <TouchableOpacity
                    style={styles.block}
                    onPress={() => navigateTo('/profile/changePic')}>
                    <Text style={styles.changePicture}>Change Picture</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.block}
                    onPress={() => navigateTo('/profile/changePic')}>
                    <Text style={styles.deletePicture}>Delete Picture</Text>
                </TouchableOpacity>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Name:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={user.userId.name}
                        onChangeText={(text) => setName(text)}
                        value={name}
                    />
                    <Text style={styles.label}>Phone Number:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={user.userId.phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text)}
                        value={phoneNumber}
                        keyboardType="phone-pad"
                    />
                    <Text style={styles.label}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={user.userId.email}
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        keyboardType="email-address"
                    />
                    <Text style={styles.label}>Password:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={user.userId.password}
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.backButton} onPress={navigateToProfile}>
                        <Text style={styles.buttonText}>Back to Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
    
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: '#F5F5F5', // Light gray background
            justifyContent: 'center',
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333333', // Primary color
            textAlign: 'center',
            marginBottom: 20,
        },
        profilePicture: {
          width: 150, // Size of the profile picture
          height: 150, // Size of the profile picture
          borderRadius: 75, // Half of the width/height to make it circular
          marginBottom: 20, // Spacing below the profile picture
          borderWidth: 3, // Optional: Add a border
          borderColor: '#A9A9A9', // Optional: Border color
      },
        formContainer: {
            backgroundColor: '#FFFFFF', // White background for the form
            borderRadius: 5,
            padding: 10,
            shadowColor: '#000', // Shadow for a card-like effect
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3, // Shadow for Android
        },
        label: {
            fontSize: 10,
            color: '#333333', // Dark gray text
            marginBottom: 5,
        },
        input: {
            height: 40,
            borderColor: '#CCCCCC', // Light gray border
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 5,
            marginBottom: 7,
            backgroundColor: '#FAFAFA', // Light gray background for inputs
        },
        submitButton: {
            backgroundColor: '#6C757D', // Primary color
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            marginBottom: 5,
        },
        backButton: {
            backgroundColor: '#CCCCCC', // Gray color for the back button
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
        },
        buttonText: {
            color: '#FFFFFF', // White text
            fontSize: 16,
            fontWeight: 'bold',
        },
        gridContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          width: '100%',
      },
        block: {
          width: '20%', // Each block takes up 48% of the container width
          aspectRatio: 1, // Makes the blocks square
          marginBottom: 5, // Adds spacing between rows
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#A9A9A9', // Background color for the block
          borderRadius: 10, // Rounded corners
          padding: 10, // Padding inside the block
      },
        changePicture: {
          color: '#FFFFFF', // Text color
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
    });