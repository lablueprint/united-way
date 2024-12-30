import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});

export default function HomeScreen() {
    const user = useSelector((state) => { return { userId: state.auth.userId, jwt: state.auth.jwt } })

    console.log(user);
    return (
        <View style={styles.container} >
            <Text>
                Main home screen test.
                User:
                {
                    user.userId
                }

                jwt:
                {
                    user.jwt
                }
            </Text>
        </ View>
    );
}