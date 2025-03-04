import { StyleSheet, View, Text } from 'react-native';
import { io } from "socket.io-client";

export default function SocketScreen() {
  const socket = io(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}`);

  // Send a message to the server
  socket.emit('message', 'Hello Server!');

  // Listen for messages from the server
  socket.on('message', (data) => {
    console.log('Server says:', data);
  });

  
  
  return (
    <View style={styles.container}>
      <Text>
        Socket page
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