import React, { StyleSheet, View, Text } from 'react-native';
import Poll from '../_components/Poll'

export default function TabTwoScreen() {
  return (
    <View>
      <Text style={styles.text}>
        Second page.
      </Text>
      <Poll id ="67908dc3339ea31330c3ce11"/>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  }
});
