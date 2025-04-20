import React from "react";
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
                name="pictureChanger"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="profileEditor"
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