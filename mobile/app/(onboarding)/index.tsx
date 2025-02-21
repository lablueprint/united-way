import { SafeAreaView, Button, StyleSheet, View, Image, Text, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Link, useRouter, Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';

export default function SignUpScreen() {
    const router = useRouter();
    const handleLogin = async () => {
        //sign-in
        router.push({ pathname: "/sign-in", params: { } });
    } 

    const handleSignup = async () => {
        router.push({pathname: "/sign-up"})
        
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
    