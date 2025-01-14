import { StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  return (
    <View style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.text}>
                For first-time users:
            </Text>
            <Link href="/onboarding">
                Onboarding
            </Link>
            <Link href="/sign-in">
                Already have an account? Sign in
            </Link>
        </View>
        {/* Super special dev button */}
        <Link href="/(tabs)" style={styles.footer}>
            Skip this and go home
        </Link>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'black',
    },
    footer: {
        padding: 24,
    }
});
