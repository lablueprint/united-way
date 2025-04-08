import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import axios from 'axios';

interface PollCardProps {
    id: string;
}

export default function Poll({ id }: PollCardProps) {
    const [polls, setPolls] = useState<PollInterface[]>([]);
    const [questionIndexes, setQuestionIndexes] = useState<{ [pollId: string]: number }>({}); // tracking question index for each poll

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

    const fetchPolls = async () => {
        try {
            console.log("Fetching polls for eventID:", id);
            const { data } = await axios.post(
                `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/activities/filtered`,
                { eventID: id, type: "poll" }
            );
            console.log("Fetched polls:", data.data[0]);
            setPolls(data.data);
        } catch (error) {
            console.error("Error fetching polls:", error);
        }
    };

    useEffect(() => {
        fetchPolls();
        const interval = setInterval(fetchPolls, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const handleVote = async (pollId: string, optionId: number) => {
        console.log(`Voting on poll ${pollId} for option ${optionId}`);

        setPolls((prevPolls) =>
            prevPolls.map((poll) =>
                poll._id === pollId
                    ? {
                          ...poll,
                          content: poll.content.map((questionObj, index) =>
                              index === (questionIndexes[pollId] || 0)
                                  ? {
                                        ...questionObj,
                                        options: questionObj.options.map((option) =>
                                            option.id === optionId
                                                ? { ...option, count: option.count + 1 }
                                                : option
                                        ),
                                    }
                                  : questionObj
                          ),
                      }
                    : poll
            )
        );
    };

    const handlePrevious = (pollId: string) => {
        setQuestionIndexes((prevIndexes) => ({
            ...prevIndexes,
            [pollId]: Math.max(0, (prevIndexes[pollId] || 0) - 1),
        }));
    };

    const handleNext = (pollId: string, totalQuestions: number) => {
        setQuestionIndexes((prevIndexes) => ({
            ...prevIndexes,
            [pollId]: Math.min(totalQuestions - 1, (prevIndexes[pollId] || 0) + 1),
        }));
    };

    return (
        <ScrollView style={styles.container}>
            {polls.length > 0 ? (
                polls
                    .filter((poll) => {
                        const now = new Date();
                        return new Date(poll.timeStart) <= now && now <= new Date(poll.timeEnd);
                    })
                    .map((poll) => (
                        <View key={poll._id} style={styles.pollCard}>
                            <Text style={styles.questionText}>
                                {poll.content[questionIndexes[poll._id] || 0]?.question || 'No question available'}
                            </Text>

                            {poll.content[questionIndexes[poll._id] || 0]?.options.map((option) => (
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
                                    onPress={() => handlePrevious(poll._id)}
                                    disabled={questionIndexes[poll._id] === 0}
                                />

                                <Button
                                    title="Next"
                                    onPress={() => handleNext(poll._id, poll.content.length)}
                                    disabled={questionIndexes[poll._id] === poll.content.length - 1}
                                />
                            </View>

                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${((questionIndexes[poll._id] || 0) + 1) / poll.content.length * 100}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    ))
            ) : (
                <Text style={styles.loadingText}>Loading polls...</Text>
            )}

            {polls.filter((poll) => {
                const now = new Date();
                return new Date(poll.timeStart) <= now && now <= new Date(poll.timeEnd);
            }).length === 0 && <Text style={styles.loadingText}>No active polls at this time.</Text>}
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
