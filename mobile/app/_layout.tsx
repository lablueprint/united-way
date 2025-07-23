import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Provider } from "react-redux";

import * as SplashScreen from "expo-splash-screen";

import "react-native-reanimated";

import store from "./_utils/redux/reduxStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    BarlowCondensed: require("../assets/fonts/BarlowCondensed-Regular.ttf"),
    BarlowCondensedBold: require("../assets/fonts/BarlowCondensed-Bold.ttf"),
    BarlowCondensedBoldItalic: require("../assets/fonts/BarlowCondensed-BoldItalic.ttf"),
    BarlowCondensedExtraBold: require("../assets/fonts/BarlowCondensed-ExtraBold.ttf"),
    BarlowCondensedExtraLight: require("../assets/fonts/BarlowCondensed-ExtraLight.ttf"),
    BarlowCondensedItalic: require("../assets/fonts/BarlowCondensed-Italic.ttf"),
    BarlowCondensedLight: require("../assets/fonts/BarlowCondensed-Light.ttf"),
    BarlowCondensedLightItalic: require("../assets/fonts/BarlowCondensed-LightItalic.ttf"),
    BarlowCondensedMedium: require("../assets/fonts/BarlowCondensed-Medium.ttf"),
    BarlowCondensedMediumItalic: require("../assets/fonts/BarlowCondensed-MediumItalic.ttf"),
    BarlowCondensedSemiBold: require("../assets/fonts/BarlowCondensed-SemiBold.ttf"),
    BarlowCondensedThin: require("../assets/fonts/BarlowCondensed-Thin.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </Provider>
  );
}