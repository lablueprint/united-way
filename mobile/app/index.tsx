import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import axios, { AxiosResponse } from "axios";

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAddUser = async () => {
        try {
            const response: AxiosResponse = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/users/createUser`,
                {
                    email: email,
                    password: password
                }
            );
            router.push({ pathname: "/onboarding", params: { id: response.data.data._id } });
        } catch (err) {
            console.log(err);
        }
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
