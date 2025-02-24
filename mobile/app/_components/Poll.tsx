import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import axios from 'axios';

interface PollCardProps {
    id: string;
}

export default function Poll({ id }: PollCardProps) {
    const [polls, setPolls] = useState<PollInterface[]>([]);
    const [currentPollIndex, setCurrentPollIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
                `http://172.31.58.60/activities/filtered`,
                { eventID: id, type: "poll" }
            );
            console.log("Fetched polls:", data.data);
            setPolls(data.data);
        } catch (error) {
            console.error("Error fetching polls:", error);
        }
    };

    useEffect(() => {
        fetchPolls();
        const interval = setInterval(fetchPolls, 5000); // Refresh every 5 seconds
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
                              index === currentQuestionIndex
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

    return (
        <ScrollView style={styles.container}>
            {polls.length > 0 ? (
                polls
                    .filter((poll) => {
                        const now = new Date();
                        return new Date(poll.timeStart) <= now && now <= new Date(poll.timeEnd);
                    })
                    .map((poll, index) => (
                        <View key={poll._id} style={styles.pollCard}>
                            <Text style={styles.questionText}>
                                {poll.content[currentQuestionIndex].question}
                            </Text>
    
                            {poll.content[currentQuestionIndex].options.map((option) => (
                                <View key={option.id} style={styles.optionContainer}>
                                    <Text style={styles.optionText}>{option.text} ({option.count} votes)</Text>
                                    <Button title={option.text} onPress={() => handleVote(poll._id, option.id)} />
                                </View>
                            ))}
    
                            <View style={styles.navButtons}>
                                <Button title="Previous" onPress={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentPollIndex === 0 && currentQuestionIndex === 0} />
                                <Button title="Next" onPress={() => setCurrentQuestionIndex(prev => prev + 1)} disabled={currentPollIndex === polls.length - 1 && currentQuestionIndex === polls[currentPollIndex].content.length - 1} />
                            </View>
    
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${((currentQuestionIndex + 1) / poll.content.length) * 100}%`,
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
