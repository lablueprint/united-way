import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Button, Dimensions, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { Typography } from '../_styles/globals';
import { transform } from "@babel/core";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

interface RaffleProps {
  number: number;
  drawnNumber: number | null;
  winner: Boolean | null;
  closeRaffle: () => void;
}

export default function Raffle({ number, drawnNumber, winner, closeRaffle }: RaffleProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {
          drawnNumber !== null
          ?
          <Text style={[Typography.h3, styles.headingText]}>
            DRAWING RESULT
          </Text>
          :
          <Text style={[Typography.h3, styles.headingText]}>
            DRAWING
          </Text>
        }
        <TouchableOpacity onPress={closeRaffle}>
          <Image style={styles.icon} source={require('../../assets/activities/close_blue.png')} />
        </TouchableOpacity>
      </View>
      {
        drawnNumber !== null
        ?
        (winner ?
          <Text style={[Typography.body2, styles.raffleText]}>
            Congratulations! You are the winner of the raffle!
          </Text>
          :
          <Text style={[Typography.body2, styles.raffleText]}>
            The winning number is {drawnNumber}. Better luck next time!
          </Text>
        )
        :
        <View>
          <Text style={[Typography.body2, styles.raffleText]}>
            Below is your drawing code which may be called out in winning. Prizes to be shown at the event!
          </Text>
          <View style={{ transform : [{ rotate: '-4.8deg' }] }}>
            <Image style={styles.ticket} source={require('../../assets/activities/raffle_ticket.png')} />
            <Text style={styles.ticketText}>
              {number}
            </Text>
          </View>
        </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: width - 48,
  },
  timeText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
  },
  headingText: {
    fontSize: 26,
    color: "#10167F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  raffleText: {
    fontSize: 16,
    marginTop: 16,
    color: "#10167F99",
  },
  loadingText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  icon: {
    height: 30,
    width: 30,
  },
  ticket: {
    resizeMode: 'contain',
    height: 220,
    width: width - 96,
    marginTop: 16,
  },
  ticketText: {
    fontFamily: 'BarlowCondensedBold',
    fontSize: 56,
    fontWeight: 700,
    position: 'absolute',
    top: 104,
    left: 118,
    color: "white",
  }
});
