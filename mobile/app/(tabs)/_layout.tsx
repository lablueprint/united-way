import { Tabs, Navigator, Stack } from "expo-router";
import React, { useState } from "react";
import { Platform, TouchableOpacity, Text } from "react-native";
import { Image } from "react-native";
import { StyleSheet } from "react-native";
import { BlurView } from 'expo-blur';

import { Typography, Color } from "../_styles/global";

const styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40
  },
  text: {
    color: Color.uwDarkBlue,
    opacity: 0.4,
    fontSize: 10
  }
})

const icon = {
  "": <Image source={require("../../assets/images/navbar/home.png")} style={styles.icon} />,
  explore: <Image source={require("../../assets/images/navbar/explore.png")} style={styles.icon} />,
  rewards: <Image source={require("../../assets/images/navbar/rewards.png")} style={styles.icon} />,
  profile: <Image source={require("../../assets/images/navbar/profile.png")} style={styles.icon} />
}

const iconSelected = {
  "": <Image source={require("../../assets/images/navbar/homeSelected.png")} style={styles.icon} />,
  explore: <Image source={require("../../assets/images/navbar/exploreSelected.png")} style={styles.icon} />,
  rewards: <Image source={require("../../assets/images/navbar/rewardsSelected.png")} style={styles.icon} />,
  profile: <Image source={require("../../assets/images/navbar/profileSelected.png")} style={styles.icon} />
}

const routeName = {
  "": <Text style={[Typography.body2, styles.text]}>Home</Text>,
  explore: <Text style={[Typography.body2, styles.text]}>Explore</Text>,
  rewards: <Text style={[Typography.body2, styles.text]}>Rewards</Text>,
  profile: <Text style={[Typography.body2, styles.text]}>Profile</Text>
}

export default function TabLayout() {
  const [selectedTab, setTab] = useState<string>("");
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 48,
          height: 91,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarBackground: () => (
          <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
        ),
        tabBarButton: (props) => {
          if (props.href) {
            const href = props.href.split("/")[1];
            return <TouchableOpacity
              onPress={(e) => { props.onPress(e); setTab(href) }}
              style={[
                {
                  display: "flex",
                  rowGap: 6,
                  marginTop: 20,
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 5,
                  height: 59
                }
              ]}
            >
              {
                selectedTab === href ? (
                  iconSelected[href]
                ) : (
                  icon[href]
                )
              }
              {
                routeName[href]
              }
            </TouchableOpacity>
          }
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Events"
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}