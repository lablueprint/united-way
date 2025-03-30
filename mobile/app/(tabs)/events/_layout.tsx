import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="events/scanner"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='events/[id]'
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='events/associated-events'
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}