import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Events from '../_components/Events';

const styles = StyleSheet.create({
  homeStyle: {
    paddingTop: 10,
    backgroundColor: "#ff9600",
    height: '100%',
  }
});

export default function EventsTab() {
  return (
    <View style={styles.homeStyle}>
      <Events/>
    </View>
  );
}