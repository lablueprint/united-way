import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import EventsFeed from "../../_components/EventsFeed";

const styles = StyleSheet.create({
  homeStyle: {
    backgroundColor: "#ff9600",
    height: "100%",
  },
});

export default function EventsTab() {
  return (
    <View style={styles.homeStyle}>
      <EventsFeed />
    </View>
  );
}
