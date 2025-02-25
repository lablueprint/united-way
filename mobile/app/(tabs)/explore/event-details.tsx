import React, { useContext, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Events from "../../_components/Events";
import EventDetails from "@/app/_components/EventDetails";

const styles = StyleSheet.create({
  homeStyle: {
    paddingTop: 10,
    backgroundColor: "#ff9600",
    height: "100%",
  },
});

export default function EventsDetails() {
  return (
    <View style={styles.homeStyle}>
      <EventDetails />
    </View>
  );
}
