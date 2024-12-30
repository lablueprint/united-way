import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, TextInput } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRouter, useRootNavigationState, Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { login } from '../_utils/redux/userSlice';
import { useSelector } from 'react-redux';

export default function OnboardingScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state) => { return { userId: state.auth.userId, jwt: state.auth.userId } })

    const validateUserInfo = async () => {
        await dispatch(login({
            userId: "675e925b07d096f5d32dacbd",
            jwt: "random_value_test"
        }))
        router.push("/(tabs)");
    }

    useEffect(() => {
        const getUser = async () => {
            return await SecureStore.getItemAsync("user");
        }

        const user = getUser();
        // If the user doesn't have existing information saved or JWT is expired...
        // console.log("user", user)
        // if (user == null) {
        // Gather username & password

        // Query the backend to get the token and associated user identifier

        // Save and dispatch this change
        // dispatchUserDetails();
        // }
    }, [])

    console.log("onboarding", user)
    if (user?.userId != undefined && user?.jwt != undefined && user?.userId != "" && user?.jwt != "") {
        return <Redirect href="/(tabs)" />
    }


    // Add the sign-in and authentication in this section before the return of the tabs and views.
    // Once the sign-in has been completed, it will redirect to the tabs with the requisite
    // authentication ready.

    return (
        <View style={styles.container}>
            <TextInput placeholder='user' textContentType='username' onChangeText={setUsername}>

            </TextInput>
            <TextInput placeholder='password' textContentType='password' onChangeText={setPassword}>

            </TextInput>
            <Button onPress={() => { validateUserInfo(); }} title="submit" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});