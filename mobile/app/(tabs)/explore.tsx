import React, { StyleSheet, View, Text } from 'react-native';
// import Poll from '../_components/Poll';
import Announcement from '../_components/Announcement';

export default function TabTwoScreen() {
  return (
    // <View>
    //   <Text style={styles.text}>
    //     Second page.
    //   </Text>
    //   <Poll id ="67908dc3339ea31330c3ce11"/>
    // </View>

    <View style={styles.container}>
      <Announcement id="67908e7a339ea31330c3ce13" />
    </View>
  );
}

const styles = StyleSheet.create({
  // text: {
  //   color: 'white',
  // }
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark background
    padding: 20,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
