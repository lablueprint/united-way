import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import axios from 'axios';

interface PollCardProps {
    activityId: string;
}

// Note: the Polls take in a Poll activity id. 
export default function Poll({ activityId }: PollCardProps) {
    const [poll, setPoll] = useState<PollInterface>();
    const [questionIndex, setQuestionIndex] = useState<number>(0); // tracking question index for each poll

    interface Choices {
        id: number;
        text: string;
        count: number;
    }

    interface PollInterface {
        eventID: string;
        _id: string;
        content: {
            question: string;
            options: Choices[];
        }[];
        timeStart: Date;
        timeEnd: Date;
    }

    const fetchPoll = async () => {
        try {
            const { data } = await axios.get(
                `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/activities/${activityId}`
            );
            setPoll(data.data);
        } catch (error) {
            console.error("Error fetching poll:", error);
        }
    };

    const handleVote = async (pollId: string, optionId: number) => {
        console.log(`Voting on poll ${pollId} for option ${optionId}`);

        // TODO: Integration with the behavior in the backend to compute votes.
        // Take a look at the structure of a poll.
        // The backend should change the number of votes for a given choice within the object.
    };

    const handlePrevious = () => {
        setQuestionIndex(questionIndex - 1);
    };

    const handleNext = () => {
        setQuestionIndex(questionIndex + 1);
    };

    useEffect(() => {
        fetchPoll();
    }, [activityId]);

    return (
        <ScrollView style={styles.container}>
            {poll ? (

                <View key={poll._id} style={styles.pollCard}>
                    <Text style={styles.questionText}>
                        {poll.content[questionIndex]?.question || 'No question available'}
                    </Text>

                    {poll.content[questionIndex]?.options.map((option) => (
                        <View key={option.id} style={styles.optionContainer}>
                            <Text style={styles.optionText}>
                                {option.text} ({option.count} votes)
                            </Text>
                            <Button title={option.text} onPress={() => handleVote(poll._id, option.id)} />
                        </View>
                    ))}

                    <View style={styles.navButtons}>
                        <Button
                            title="Previous"
                            onPress={() => handlePrevious()}
                            disabled={questionIndex === 0}
                        />

                        <Button
                            title="Next"
                            onPress={() => handleNext()}
                            disabled={questionIndex === poll.content.length - 1}
                        />
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBar,
                                {
                                    width: `${((questionIndex || 0) + 1) / poll.content.length * 100}%`,
                                },
                            ]}
                        />
                    </View>
                </View>
            ) : (
                <Text style={styles.loadingText}>Loading poll...</Text>
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
    optionContainer: {
        marginVertical: 4,
    },
    optionText: {
        fontSize: 16,
        color: '#ccc',
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    progressBarContainer: {
        height: 20,
        width: '100%',
        backgroundColor: 'lightgray',
        marginTop: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'green',
    },
    loadingText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
});
