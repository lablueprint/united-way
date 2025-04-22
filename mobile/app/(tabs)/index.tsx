import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useSelector } from "react-redux";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});

export default function HomeScreen() {
  const user = useSelector(
    (state: {
      auth: { userId: string; authToken: string; refreshToken: string };
    }) => {
      return {
        userId: state.auth.userId,
        authToken: state.auth.authToken,
        refreshToken: state.auth.refreshToken,
      };
    }
  );
  console.log(`\nuser: ${user.userId}\nauth: ${user.authToken}\nrefresh: ${user.refreshToken}`)
  return (
    <View style={styles.container}>
      <Text>
        Main home screen test. Tokens in console.
      </Text >
    </View >
  );
}
