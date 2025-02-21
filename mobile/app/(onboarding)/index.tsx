import { Button, StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter, Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';

export default function SignUpScreen() {
    const router = useRouter();
    const handleLogin = async () => {
        //sign-in
        router.push({ pathname: "/sign-in", params: { } });
    } 

    const handleSignup = async () => {
        router.push({pathname: "/login"})
    }
    return (
        <View style={styles.container}>
            <View>
                <Image
                    source = {require('/Users/vanshika/Documents/Documents/Blueprint/united-way/mobile/app/(onboarding)/assets/temp-image.png')}
                />
            </View>
            <View>
                <Text style={styles.organizationName}>UNITED WAY</Text> 
                <Text style ={styles.heading}>Explore upcoming community events</Text>
                <Text style={styles.subheading}>Stay in the loop</Text>
                <TouchableOpacity style = {styles.loginbutton} onPress = {handleLogin}>
                    <Text style = {styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {styles.signupbutton} onPress = {handleSignup}>
                    <Text style = {styles.signupButtonText}>Get started without an account</Text>
                </TouchableOpacity>
            </View>
            
        </View>
    );}

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'space-between',
            
            alignItems: 'center',
        },
        organizationName: {
            marginTop: 20,
            fontSize: 12,
            color: '#999',
            marginBottom: 8,
        },
        heading: {
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 8,
            lineHeight: 34,
            textAlign: 'center',
            marginHorizontal: 10,
        },
        subheading: {
            fontSize: 24,
            color: '#666',
            marginBottom: 40,
            fontWeight: '600',
        },
        loginbutton: {
            backgroundColor: '#000',
            borderRadius: 8,
            padding: 16,
            paddingHorizontal: 145,
            alignItems: 'center',
            marginBottom: 12,
        },
        loginButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '500',
        },
        signupbutton: {
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            padding: 16,
            paddingHorizontal: 50,
            alignItems: 'center',
            marginBottom: 40,
        },
        signupButtonText: {
            color: '#000',
            fontSize: 16,
            fontWeight: '500',
        }
    });
    