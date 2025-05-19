import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { io, Socket } from "socket.io-client";
import { Typography } from '../_styles/globals';
import * as Progress from 'react-native-progress';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

interface PollCardProps {
    activityId: string;
    socket: Socket;
    closePoll: () => void;
    showResults: Boolean;
    pollResponses: (number | null)[];
    setPollResponses: (pollResponses: (number | null)[]) => void;
}

// Note: the Polls take in a Poll activity id. 
export default function Poll({ activityId, socket, closePoll, showResults, pollResponses, setPollResponses}: PollCardProps) {
    const [poll, setPoll] = useState<PollInterface>();
    const [questionIndex, setQuestionIndex] = useState<number>(0); // tracking question index for each poll
    const [responses, setResponses] = useState<(number | null)[]>(pollResponses);

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
            totalVotes: number;
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
            setResponses(pollResponses);
        } catch (error) {
            console.error("Error fetching poll:", error);
        }
    };

    const handleVote = (pollId: string, optionId: number) => {
        // Keep track of selected options
        const newResponses = [...responses];
        newResponses[questionIndex] = optionId;
        setResponses(newResponses);
        console.log(responses);
    };

    const handleSubmit = () => {
        socket.emit('submit poll', responses, poll);
        setPollResponses(responses);
        closePoll();
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
        <View style={[styles.container, { backgroundColor: showResults ? '#10167F' : '#E7F3FE' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={closePoll}>
                    <Image style={styles.icon} source={ showResults ? require('../../assets/activities/close_white.png') : require('../../assets/activities/close_blue.png')} />
                </TouchableOpacity>
                {
                    showResults ?
                    <Text style={[Typography.h3, styles.resultsHeaderText]}>POLL RESULTS</Text>
                    :
                    <Text style={[Typography.h3, styles.headerText]}>POLL</Text>
                }
            </View>
            {poll ? (
                <View key={poll._id} style={styles.pollCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handlePrevious} disabled={questionIndex === 0}>
                            <Image style={styles.arrow} source={require('../../assets/activities/arrow_backward.png')} />
                        </TouchableOpacity>
                        <Progress.Bar
                            progress={((questionIndex || 0) + 1) / poll.content.length}
                            width={200}
                            borderColor={'#FFFFFF'}
                            unfilledColor={'#10167F66'}
                            color={'#10167F'}
                        />
                        <TouchableOpacity onPress={handleNext} disabled={questionIndex === poll.content.length - 1 || (!showResults && responses[questionIndex] === null)}>
                            <Image style={styles.arrow} source={require('../../assets/activities/arrow_forward.png')} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[Typography.body1, styles.questionText]}>
                        {poll.content[questionIndex]?.question || 'No question available'}
                    </Text>

                    {
                        showResults ?
                        poll.content[questionIndex]?.options.map((option) => (
                            <View key={option.id} style={responses[questionIndex] === option.id ? styles.selectedOptionContainer : styles.optionContainer}>
                                <View style={[styles.percentageContainer, { width: poll.content[questionIndex].totalVotes > 0 ? `${Math.round((option.count / poll.content[questionIndex].totalVotes) * 100)}%` : '0%'}]}>
                                    <Text style={[Typography.h3, styles.optionLetter]}>{String.fromCharCode(option.id + 64)}</Text>
                                    <Text style={styles.optionText}>
                                        {option.text}
                                    </Text>
                                </View>
                                <View style={styles.percentageTextContainer}>
                                    <Text style={styles.optionText}>
                                        {poll.content[questionIndex].totalVotes > 0 ? `${Math.round((option.count / poll.content[questionIndex].totalVotes) * 100)}%` : '0%'}
                                    </Text>
                                </View>
                            </View>
                        ))
                        :
                        poll.content[questionIndex]?.options.map((option) => (
                            <TouchableOpacity key={option.id} style={responses[questionIndex] === option.id ? styles.selectedOptionContainer : styles.optionContainer} onPress={() => handleVote(poll._id, option.id)}>
                                <Text style={[Typography.h3, styles.optionLetter]}>{String.fromCharCode(option.id + 64)}</Text>
                                <Text style={styles.optionText}>
                                    {option.text}
                                </Text>
                            </TouchableOpacity>
                        ))
                    }
                    {questionIndex === poll.content.length - 1 ? (
                        showResults ?
                        <TouchableOpacity
                            style={styles.button}
                            onPress={closePoll}
                        >
                            <Text style={[Typography.h3, styles.buttonText]}>CLOSE</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                            disabled={responses.some((response) => response === null)}
                        >
                            <Text style={[Typography.h3, styles.buttonText]}>SUBMIT</Text>
                        </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleNext}
                                disabled={questionIndex === poll.content.length - 1 || (!showResults && responses[questionIndex] === null)}
                            >
                                <Text style={[Typography.h3, styles.buttonText]}>NEXT</Text>
                            </TouchableOpacity>
                        )
                    }
                </View>
            ) : (
                <Text style={styles.loadingText}>Loading poll...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        height: '100%',
        width: '100%',
        backgroundColor: '#E7F3FE',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        margin: 24,
        flexDirection: 'row',
    },
    headerText: {
        color: '#10167F',
        textAlign: 'center',
        width: width - 108,
    },
    resultsHeaderText: {
        color: 'white',
        textAlign: 'center',
        width: width - 108,
    },
    pollCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowRadius: 3,
        height: height * 0.84,
    },
    questionText: {
        marginTop: 24,
        marginBottom: 24,
        fontWeight: 700,
        color: '#10167F',
    },
    optionContainer: {
        marginVertical: 8,
        height: 48,
        backgroundColor: '#10167F14',
        borderRadius: 24,
        borderColor: '#10167F33',
        borderWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },
    selectedOptionContainer: {
        marginVertical: 8,
        height: 48,
        backgroundColor: '#10167F14',
        borderRadius: 24,
        borderColor: '#FBA541',
        borderWidth: 4,
        alignItems: 'center',
        flexDirection: 'row',
    },
    percentageContainer: {
        height: 48,
        backgroundColor: '#10167F33',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#10167F',
        borderRadius: 24,
        height: 48,
        marginTop: 24,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#10167F',
    },
    percentageTextContainer: {
        position: 'absolute',
        right: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        marginLeft: 36,
        marginRight: 36,
        fontSize: 26,
    },
    optionLetter: {
        color: '#10167F',
        marginLeft: 16,
        marginRight: 16,
        fontSize: 26,
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
    icon: {
        height: 30,
        width: 30,
    },
    arrow: {
        height: 24,
        width: 24,
    },
});
