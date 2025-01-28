import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';

interface PollCardProps {
    id: string; // Ensure the type here is a string, not an object
}

export default function Poll({ id }: PollCardProps) {
    interface PollInterface {
        eventID: string;
        _id: number;
        content: {
            options: Choices[];
            question: string;
        };
    }
    interface Choices {
        id: number;
        text: string;
        count: number;
    }

    const [polls, setPolls] = useState<PollInterface[]>([]);

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                console.log("Fetching polls for eventID:", id);
                const { data } = await axios.post(
                    `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/activities/filtered`,
                    {
                        eventID: id,
                        type: "poll", // Send type "poll" in the request body
                    }
                );

                setPolls(data.data); // Save the filtered polls in state
                console.log("Fetched polls:", data.data);
            } catch (error) {
                console.error("Error fetching polls:", error);
            }
        };

        fetchPolls(); // Call the async function
    }, [id]); // Dependency array ensures this effect runs when `id` changes

    return (
        <ScrollView style={styles.container}>
            {polls.length > 0 ? (
                polls.map((poll) => (
                    <View key={poll._id} style={styles.pollCard}>
                        <Text style={styles.questionText}>{poll.content.question}</Text>
                        {poll.content.options.map((option) => (
                            <Text key={option.id} style={styles.optionText}>
                                {option.text} ({option.count} votes)
                            </Text>
                        ))}
                    </View>
                ))
            ) : (
                <Text style={styles.loadingText}>Loading polls...</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
    },
    pollCard: {
        backgroundColor: '#2c2c2c',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#ccc',
        marginVertical: 4,
    },
    loadingText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
});
