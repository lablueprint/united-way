import React from "react";
import { StyleSheet, View } from "react-native";
import WeekCalendar from "../_components/WeekCalendar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 24,
    padding: 16,
    paddingVertical: 72,
  },
  header: {
    textTransform: "uppercase",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 32,
  },
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <WeekCalendar />
    </View>
  );
}
