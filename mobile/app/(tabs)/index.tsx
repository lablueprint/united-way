import { StyleSheet, View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text style={styles.text}>
        Hello world!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white'
  },
});
