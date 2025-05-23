import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="events-tab"
        options={{
          headerShown: false,
          animation: "slide_from_left"
        }}
      />
      <Stack.Screen
        name='[id]'
        options={{
          headerShown: false,
          animation: "none"
        }}
      />
      <Stack.Screen
        name='associated-events'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
