import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>

            <Stack.Screen name = "index" options={{headerShown: false, title: 'Splash', gestureEnabled: false}} />
            {/*<Stack.Screen name = "onboard2" options={{headerShown: false, title: 'Onboard2', gestureEnabled: false}} />*/}
            {/*<Stack.Screen name = "onboard3" options={{headerShown: false, title: 'Onboard3', gestureEnabled: false}} />*/}
            {/*<Stack.Screen name = "intro" options={{headerShown: false, title: 'Introduction', gestureEnabled: false}} />*/}
            <Stack.Screen name = "sign-up" options={{ headerShown: false, title: 'Sign Up', gestureEnabled: false }} />
            <Stack.Screen name = "sign-in" options={{ headerShown: false, title: 'Sign In', gestureEnabled: false }} />
            <Stack.Screen name = "two-step" options={{ headerShown: false, title: 'Two-Step Verification', gestureEnabled: false }} />
            <Stack.Screen name = "onboarding" options={{ headerShown: false, title: 'Onboarding', gestureEnabled: false }} />
            <Stack.Screen name = "location" options={{ headerShown: false, title: 'Location', gestureEnabled: false }} />
            <Stack.Screen name = "interest" options={{ headerShown: false, title: 'Interest', gestureEnabled: false }} />
        </Stack>
    )
}