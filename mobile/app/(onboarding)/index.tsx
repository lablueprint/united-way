import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useRouter, Redirect } from 'expo-router';
import axios, { AxiosResponse } from "axios";
import * as SecureStore from 'expo-secure-store';
import { login } from '../_utils/redux/userSlice';

export default function SignUpScreen() {
    const handleLogin = async () => {
        //sign-in
        router.push({ pathname: "/sign-in", params: { } });
    } 
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState('');
    const router = useRouter();
    const dispatch = useDispatch();

    const handleSignup = async () => {
        router.push({pathname: "/sign-up"})
        
    }

    const handleAddUser = async () => {
        // Check if email and password are valid
        // TODO: Backend password validation
        if (!validateInputs()) {
            return;
        }
        // Check if email is in database already
        if (await userExists() != null) {
            Alert.alert('This email is already associated with an account.');
            return;
        }
        // Add user to database
        try {
            const response: AxiosResponse = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
                {
                    email: email,
                    password: password
                }
            );

            // Navigate to onboarding screen
            dispatch(login({
                userId: response.data.data._id,
                authToken: response.data.authToken,
                refreshToken: response.data.refreshToken
            }))

            router.push({ pathname: "/onboarding", params: { id: response.data.data._id, authToken: response.data.authToken} });
        } catch (err) {
            console.log(err);
        }
    }

    const userExists = async () => {
        // Check if email is in database already
        try {
            const response: AxiosResponse = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/email/${email}`);
            return response.data.data;
        } catch (err) {
            console.log(err);
        }
    }

    const validateInputs = () => {
        if (!validateEmail()) {
            Alert.alert('Enter a valid email.');
            return false;
        } else if (!validatePassword()) {
            Alert.alert('Enter a valid password. Your password must contain at least 12 characters including an uppercase letter, a lowercase letter, a symbol, and a number.')
            return false;
        }
        return true;
    }

    const validatePassword = () => {
        // Require 12+ characters including uppercase and lowercase letters, a symbol, and a number
        return password.match(
            /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,}$/
        );
    }

    const validateEmail = () => {
        // Practical implementation of RFC 2822 from https://www.regular-expressions.info/email.html
        return email.toLowerCase().match(
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        );
    }

    return (

        <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
            {/* Placeholder box */}
            <View style={styles.placeholderBox} />
            
            {/* Main content */}
            <View style={styles.mainContent}>
            <Text style={styles.smallText}>UNITED WAY</Text>
            <Text style={styles.title}>Explore upcoming{'\n'}community events</Text>
            <Text style={styles.subtitle}>Stay in the loop</Text>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.loginButton} onPress = {handleSignup}>
                <Text style={styles.loginButtonText}>Sign Up</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.getStartedButton} onPress = {handleLogin}>
                <Text style={styles.getStartedText}>Login</Text>
                </TouchableOpacity>
            </View>
            </View>

            {/* Language selector */}
            <View style={styles.languageContainer}>
            <TouchableOpacity style={styles.languageButton}>
                <Text style={styles.languageText}>ES</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.languageButton, styles.languageButtonActive]}>
                <Text style={[styles.languageText, styles.languageTextActive]}>EN</Text>
            </TouchableOpacity>
            </View>
        </View>
        </SafeAreaView>
        </View>
    );}

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: 'white',
        },
        safeArea: {
          flex: 1,
        },
        content: {
          flex: 1,
          paddingHorizontal: 20,
          justifyContent: 'space-between',
        },
        placeholderBox: {
          alignItems: 'center',
          aspectRatio: 1,
          width: '100%',
          borderRadius: 12,
          backgroundColor: '#1815150A',
          marginTop: 20,
        },
        mainContent: {
          alignItems: 'center',
        },
        smallText: {
          fontSize: 16,
          color: '#666',
          marginTop: 50,
        },
        title: {
          fontSize: 32,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 2,
        },
        subtitle: {
          fontSize: 24,
          color: '#666',
          marginBottom: 20,
        },
        buttonContainer: {
          width: '100%',
          gap: 16,
        },
        loginButton: {
          backgroundColor: 'black',
          padding: 16,
          borderRadius: 5,
          width: '100%',
          marginBottom: -6,
          
        },
        loginButtonText: {
          color: 'white',
          textAlign: 'center',
          fontSize: 18,
        },
        getStartedButton: {
          padding: 16,
          backgroundColor: '#F2F2F2',
          borderRadius: 8,
        },
        getStartedText: {
          textAlign: 'center',
          fontSize: 16,
        },
        languageContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: 20,
          marginTop: 15,
          backgroundColor: '#F2F2F2',
          borderRadius: 8,
          padding: 4,
          alignSelf: 'center',
        },
        languageButton: {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 6,
        },
        languageButtonActive: {
          backgroundColor: '#333',
        },
        languageText: {
          fontSize: 16,
          color: '#333',
        },
        languageTextActive: {
          color: 'white',
        },
      });
    