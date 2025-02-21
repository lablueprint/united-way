import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen name = "intro" options={{headerShown: false, title: 'Introduction', gestureEnabled: false}} />
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Sign Up', gestureEnabled: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false, title: 'Sign In', gestureEnabled: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false, title: 'Onboarding', gestureEnabled: false }} />
        </Stack>
    )
}