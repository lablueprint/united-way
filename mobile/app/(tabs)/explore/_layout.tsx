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
    </Stack>
  );
}
