import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useRouter, Redirect } from 'expo-router';
import axios, { AxiosResponse } from "axios";
import * as SecureStore from 'expo-secure-store';
import { login } from '../_utils/redux/userSlice';

export default function SignUpScreen() {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const storedUser = await SecureStore.getItemAsync("user");
            if (storedUser != null) {
                const parsedUser = JSON.parse(storedUser);
                setId(parsedUser.userId);
                dispatch(login({
                    userId: parsedUser.userId,
                    authToken: parsedUser.authToken,
                    refreshToken: parsedUser.refreshToken
                }));
            }
        };
        getUser();
    }, [])

    if (id) {
        return <Redirect href="/(tabs)" />
    }

    const handleAddUser = async () => {
        //router.push({ pathname: "/two-step" });
        console.log("trying to sign up");
        {/* Remove this later */}
        // Check if email and password are valid
        // TODO: Backend password validation
        if (!validateInputs()) {
            return;
        }
        console.log("validated");
        // Check if email is in database already
        if (await userExists() != null) {
            Alert.alert('This email is already associated with an account.');
            return;
        }
        console.log("check database");
        // Add user to database
        try {
            const response: AxiosResponse = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
                {
                    email: email,
                    password: password
                }
            );
            console.log("post to database");
            //Navigate to onboarding screen
            await dispatch(login({
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
            <View style={styles.formContainer}>
                <Text style={styles.title}>
                    Sign up
                </Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry
                    />
                </View>
                <TouchableOpacity style={styles.signUpButton} onPress={handleAddUser}>
                    <Text style={styles.signUpButtonText} >Sign up</Text>
                    {/*make it onPress handleAddUser right now it temporarily goes to two factor auth */}
                </TouchableOpacity>
                <View style={styles.loginSection}>
                    <Text style={styles.loginLabel}>ALREADY HAVE AN ACCOUNT?</Text>
                    <Link style={styles.loginLink} href="/sign-in">
                        Already have an account? Sign in
                    </Link>
                </View>
                <View style={styles.skipSection}>
                          <Text style={styles.skipLabel}>DON'T WANNA MAKE AN ACCOUNT?</Text>
                          <Link style={styles.skipLink} href="/">
                          Continue to dashboard </Link>
                        </View>
                
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
      backgroundColor: 'white',
    },
    formContainer: {
      flex: 1,
      padding: 20,
      marginTop: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 40,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      color: '#666',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#F5F5F5',
      padding: 16,
      borderRadius: 8,
      fontSize: 16,
    },
    profileContainer: {
      alignItems: 'center',
      marginVertical: 24,
    },
    chatBubble: {
      backgroundColor: '#007AFF',
      borderRadius: 30,
      padding: 3,
    },
    profileImage: {
      width: 54,
      height: 54,
      borderRadius: 27,
    },
    signUpButton: {
      backgroundColor: 'black',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    signUpButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    loginSection: {
      marginTop: 40,
    },
    loginLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    loginLink: {
      color: '#666',
      textDecorationLine: 'underline',
    },
    skipSection: {
      marginTop: 40,
    },
    skipLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    skipLink: {
      color: '#666',
      textDecorationLine: 'underline',
    },
  });
