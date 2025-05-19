import React from 'react';
import { View, Text, StyleSheet } from 'react-native'

interface EventCardProps {
  title: string;
  date: string;
}

const EventCard = ({ title, date }: EventCardProps) => {
  return (
    <View style={styles.card}>
        <View style = {styles.topCard}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
        </View>
        <View style = {styles.bottomCard}>
        <View style={styles.bottomContent}>
          <View style={styles.circle} />
          <Text style={styles.uwtext}>UNITED WAY OF GREATER LOS ANGELES</Text>
        </View>
        </View>
    </View>
  );
};

export default EventCard;
const styles = StyleSheet.create({
    card: {
      width: 327,
      height: 200,
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      alignSelf: 'center',
      marginTop: 20,
      zIndex: 1,
    },
    textContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingHorizontal: 20,
      paddingTop: 15,
    },
    title: {
      fontFamily: 'Helvetica',
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 13,
      letterSpacing: 0,
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      height: 25,
      borderRadius: 100,
      paddingTop: 6,
      paddingRight: 10,
      paddingBottom: 6,
      paddingLeft: 10,
      color: '#FFFFFF',
    },
    date: {
      fontFamily: 'Helvetica',
      fontWeight: '700',
      fontSize: 12,
      lineHeight: 13,
      letterSpacing: 0,
      textAlign: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      height: 25,
      borderRadius: 100,
      paddingTop: 6,
      paddingRight: 10,
      paddingBottom: 6,
      paddingLeft: 10,
      marginLeft: 10,
      color: '#FFFFFF',
    },
    bottomCard: {
      width: 327,
      // Remove color – does not apply to Views
      backgroundColor: '#FFFFFF',
    },
    topCard: {
      height: 156,
      backgroundColor: '#FFA500',
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    bottomContent: {
        flexDirection: 'row',
        alignItems: 'center', // vertical alignment
        justifyContent: 'flex-start',
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: '#808080',
        marginHorizontal: 4,
        justifyContent: 'center', // vertical alignment
        marginTop: 6,
        marginLeft: 12,
    },
    uwtext: {
        fontFamily: 'BarlowCondensed-Italic', // This assumes you've loaded the italic variant
        fontWeight: '600',
        fontSize: 13,
        lineHeight: 18, // 100% of 18px
        letterSpacing: 0,
        marginTop: 8,
        marginLeft: 4,
        color: '#10167F',
    }
  });