import React from "react";
import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="profilePage"
                options={{
                    headerShown: false,
                    animation: "slide_from_left"
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