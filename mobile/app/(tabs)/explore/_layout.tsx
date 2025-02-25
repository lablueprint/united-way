import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="main"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="events-tab"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
