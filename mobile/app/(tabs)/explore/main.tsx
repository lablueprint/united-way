import { StyleSheet, View, Text } from 'react-native';
export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text>
        Exploration feed/page.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});