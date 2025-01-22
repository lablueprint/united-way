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
            <View style={styles.content}>
                <Text style={styles.text}>
                    For first-time users:
                </Text>
                <TextInput
                    placeholder="Email"
                    onChangeText={setEmail}
                    value={email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />
                <TouchableOpacity onPress={handleAddUser}>
                    <Text>
                    Sign up
                    </Text>
                </TouchableOpacity>
                <Link href="/sign-in">
                    Already have an account? Sign in
                </Link>
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
