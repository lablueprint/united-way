import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import UserSignUpForm from '../Components/UserSignUpForm';

const styles = StyleSheet.create({
  homeStyle: {
    padding: 5,
    backgroundColor: "cyan",
    marginTop: "30%",
  }
});

export default function HomeScreen() {
  return (
    <View style={styles.homeStyle}>
      <UserSignUpForm/>
    </View>
  );
}