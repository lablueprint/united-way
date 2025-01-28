import React, { useState } from 'react';
import { View, Button, TextInput, Text, ScrollView } from 'react-native';
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

  const handleNextQuestion = async () => {
      try {
        console.log("Polls id: " + id);
        const { data } = await axios.post(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
          {
            eventID: id,
            type: "poll", // Send type "poll" in the request body
          }
        );

        setPolls(data.data); // Save the filtered activities in state
        console.log("Data " + data.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
    }
  }

  return (
    <Text> {/* Use ScrollView to handle long lists */}
        {polls.map((poll) => (
            <View key={poll._id} style={{ margin: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: 'white' }}>
                    {poll.content.question}
                </Text>
                {poll.content.options.map((option) => (
                    <Text key={option.id} style={{ marginVertical: 2, color: 'white' }}>
                        {option.text} ({option.count} votes)
                    </Text>
                ))}
            </View>
        ))}
        {/* <Button title="Next Question" onPress={() => handleNextQuestion('your-event-id')} /> */}
    </Text>
);
}