import { StyleSheet, View, Text } from 'react-native';
export default function TabTwoScreen() {
  return (
    <View>
      <Text style={styles.text}>
        Second page.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  }
});
