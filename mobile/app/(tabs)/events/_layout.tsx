import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="scanner">
      <Stack.Screen
        name="scanner"
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
  )
}