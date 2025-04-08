import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="scanner"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
