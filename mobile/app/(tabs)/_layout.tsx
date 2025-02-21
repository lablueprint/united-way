import { Tabs, Navigator, Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        // Use a transparent background on iOS to show the blur effect
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: 'Events',
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings'
                }}
            />
        </Tabs>
    );
}
