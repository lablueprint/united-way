"use client"
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import axios, { AxiosResponse } from "axios";
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';


export default function EditProfilePictures() {
    const user = useSelector((state) => { return { userId: state.auth.userId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } })
    const [pictureLink, setPictureLink] = useState<string>(""); //find blank pfp pic link
    const router = useRouter();

    const handleSubmit = async (profilePicture: string) => {
        try {
            const response: AxiosResponse = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/${user.userId}`,
                {
                    profilePicture: profilePicture,
                },
                {
                    headers: {
                          'Authorization': `Bearer ${user.authToken}`,
                          'Content-Type': "application/json"
                        },
                }
            );
            const { data } = response.data.data.profilePicture;
            setPictureLink(data);
            console.log('PFP updated successfully', data);
        } catch (err) {
            console.error('Error updating PFP:', err);
          }
    }

    const navigateToEditing = () => {
        router.push(`/profile/editing`);
  }

  return (
    <View style={styles.container}>
        <Text style={styles.label}>
            Profile Picture URL
        </Text>
        <TextInput
            placeholder="Enter image URL"
            onChangeText={(text) => setPictureLink(text)}
            value={pictureLink}
            style={styles.input}
        />
        <View style={styles.buttonContainer}>
            <Button 
                title="Submit" 
                onPress={() => handleSubmit(pictureLink)} 
                color="#666666"
            />
            <Button 
                title="Back to Editing" 
                onPress={navigateToEditing} 
                color="#999999"
            />
        </View>
    </View>
)
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    buttonContainer: {
        gap: 12,
    },
});