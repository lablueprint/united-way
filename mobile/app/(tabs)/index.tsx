import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import WeekCalendar from '../_components/WeekCalendar';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 24,
    padding: 16,
    paddingVertical: 72,
  },
  header: {
    textTransform: 'uppercase',
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: 32,
  }
});

//get the user by id and then just take the registeredevents

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <WeekCalendar />
    </View >
  );
}
