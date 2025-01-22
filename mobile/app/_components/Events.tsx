import React from 'react';
import { View, Button, Text, StyleSheet} from 'react-native';
import axios from 'axios';

const styles = StyleSheet.create({
    titletext: {
    fontSize: 40,
    paddingTop: 200,
    color: "white",
  }
});

export default function Events() {
    
    return (
      <View>
        <Text style={styles.titletext}>Events</Text>
      </View>
    );
  }


