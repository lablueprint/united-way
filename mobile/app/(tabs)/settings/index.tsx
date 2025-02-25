import { StyleSheet, View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '@/app/_utils/redux/userSlice';
import { useRouter } from 'expo-router';
export default function Settings() {
    const dispatch = useDispatch();
    const router = useRouter();

    const dispatchLogout = async () => {
        await dispatch(logout());
    }
    return (
        <View style={styles.container}>
            <Text>
                Settings
            </Text>
            <Button title="Log out" onPress={() => { dispatchLogout(); router.push("/(onboarding)") }} />
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