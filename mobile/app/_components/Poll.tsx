import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import axios from 'axios';

interface PollCardProps {
    id: string; // Ensure the type here is a string, not an object
}

export default function Poll({ id }: PollCardProps) {

    const [currentStep, setCurrentStep] = useState(0);

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
    const [progress, setProgress] = useState<Number>(0);

    //const handlePrevious = async () => {
        //{currentStep} = 1
    //}

    const handleVote = async (pollId: number, optionId: number) => {
        console.log(`Voting on poll ${pollId} for option ${optionId}`);
        // setPolls((prevPolls) =>
        //     prevPolls.map((poll) =>
        //         poll._id === pollId
        //             ? {
        //                   ...poll,
        //                   content: {
        //                       ...poll.content,
        //                       options: poll.content.options.map((option) =>
        //                           option.id === optionId
        //                               ? { ...option, count: option.count + 1 } // Increment vote count locally
        //                               : option
        //                       ),
        //                   },
        //               }
        //             : poll
        //     )
        // );
    };


    useEffect(() => {
        const fetchPolls = async () => {
            try {
                console.log("Fetching polls for eventID:", id);
                const { data } = await axios.post(
                    `http://192.168.1.113:4000/activities/filtered`,
                    {
                        eventID: id,
                        type: "poll", // Send type "poll" in the request body
                    }
                );
                console.log(data);
                console.log("Client sent:", { eventID: id, type: "poll" });
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
            


            {polls.length > 0 ? 
            (
                //polls.map((poll) => (
                    <View key={polls[currentStep]._id} style={styles.pollCard}>
                        <Text style={styles.questionText}>{polls[currentStep].content.question}</Text>
                        {polls[currentStep].content.options.map((option) => (
                            <>
                            <Text key={option.id} style={styles.optionText}>
                                {option.text} ({option.count} votes)
                            </Text>
                            <Button title = {`${option.text} (${option.count})`} onPress={() => handleVote(polls[currentStep]._id, option.id)}/>
                            </>
                            
                        ))}
                        <View>
                        <Button title="Previous" onPress={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0} />
                        <Button title="Next" onPress={() => setCurrentStep(currentStep + 1)} disabled={currentStep === polls[0].content.options.length - 1} />
                        </View>
                        <View style={{ height: 20, width: '100%', backgroundColor: 'lightgray' }}>
                        <View
                            style={{
                                height: '100%',
                                width: `${((1 + currentStep)/polls.length)*100}%`,
                                backgroundColor: 'green',
                            }}
                        />
      </View>
                        
                    </View>
                //))


                // polls.map((poll) => (
                //     <View key={poll._id} style={styles.pollCard}>
                //         <Text style={styles.questionText}>{poll.content.question}</Text>
                //         {poll.content.options.map((option) => (
                //             <>
                //             <Text key={option.id} style={styles.optionText}>
                //                 {option.text} ({option.count} votes)
                //             </Text>
                //             <Button title = {`${option.text} (${option.count})`} onPress={() => handleVote(poll._id, option.id)}/>
                //             </>
                            
                //         ))}
                //     </View>
                // ))
            ) 
            : (
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