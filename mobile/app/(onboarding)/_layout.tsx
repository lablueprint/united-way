import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Splash', gestureEnabled: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false, title: 'Sign Up', gestureEnabled: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false, title: 'Sign In', gestureEnabled: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, title: 'Onboarding', gestureEnabled: false }} />
            <Stack.Screen name="interest" options={{ headerShown: false, title: 'Interest', gestureEnabled: false }} />
        </Stack>
    )
}