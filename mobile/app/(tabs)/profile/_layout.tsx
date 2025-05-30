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
                name="contact"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="account"
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