import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="profilePage"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="changePic"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="editing"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="passport"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}