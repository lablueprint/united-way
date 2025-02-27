import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';

interface Question {
  title: string;
  choices: [string];
  answers: [number];
  singleSelect: boolean;
}

const styles = StyleSheet.create({
  choices: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  questions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 5
  }
})

interface QuizProps {
  activityId: string;
}

export default function Quiz({ activityId }: QuizProps) {
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [singleSelect, setSingleSelect] = useState<boolean>();
  const [title, setTitle] = useState<string>();
  const [choices, setChoices] = useState<[string]>();
  const [answers, setAnswers] = useState<[number]>();
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number[] }>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const incomingActivity = await getActivityById(activityId);
      const activityData = incomingActivity.data;
      setUpdatedQuestions(activityData.content);
      setQuestionIndex(0);
      setTitle(activityData.content[0].title);
      setChoices(activityData.content[0].choices);
      setAnswers(activityData.content[0].answers);
      setSingleSelect(activityData.content[0].singleSelect);
      setUserAnswers([]);
    };
    fetchQuestions();
  }, [activityId]);

  const getActivityById = async (activityID: string) => {
    try {
      const { data } = await axios.get(
        `http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/activities/${activityID}`
      );
      return data;
    } catch (err) {
      console.log(err);
      return err;
    }
  };

  return (
    <View>
      <View style={styles.questions}>
        {updatedQuestions.map((_, index) => {
          return (
            <Button
              title={`${index + 1}`}
              key={`b${index}`}
              onPress={() => {
                setQuestionIndex(index);
                setTitle(updatedQuestions[index].title);
                setChoices(updatedQuestions[index].choices);
                setAnswers(updatedQuestions[index].answers);
                setSingleSelect(updatedQuestions[index].singleSelect);
              }}
            />
          );
        })}
      </View>
      <Text>{title}</Text>

      {/* EVERYTHING BELOW HERE SHOULD BE userAnswers */}

      {
        choices?.map((choice, choiceIndex) => (
          <View key={`choice-${choiceIndex}`} style={styles.choices}>
            <Text style={{ marginRight: 10 }}>{choice}</Text>
            {singleSelect ? (
              <Button
                title={userAnswers[questionIndex] && userAnswers[questionIndex].includes(choiceIndex) ? 'Selected' : 'Select'}
                onPress={() => {
                  // For single select, always store only one answer.
                  let updatedUserAnswers: { [key: number]: number[] } = JSON.parse(JSON.stringify(userAnswers));
                  updatedUserAnswers[questionIndex] = [choiceIndex]
                  setUserAnswers(updatedUserAnswers);
                }}
              />
            ) : (
              <Button
                title={userAnswers[questionIndex] && userAnswers[questionIndex].includes(choiceIndex) ? 'Selected' : 'Select'}
                onPress={() => {
                  let updatedUserAnswers: { [key: number]: number[] } = JSON.parse(JSON.stringify(userAnswers));

                  // If the question index has a selection already:
                  if (updatedUserAnswers[questionIndex]) {
                    // If the choice has already been selected before, we will remove it (unselecting).
                    if (updatedUserAnswers[questionIndex].includes(choiceIndex)) {
                      updatedUserAnswers[questionIndex].splice(updatedUserAnswers[questionIndex].indexOf(choiceIndex), 1)
                    }
                    // If the choice has not been selected, we will add it (selecting).
                    else {
                      updatedUserAnswers[questionIndex].push(choiceIndex);
                    }
                  }
                  // Else the question simply selects the option provided. 
                  else {
                    updatedUserAnswers[questionIndex] = [choiceIndex];
                  }
                  setUserAnswers(updatedUserAnswers);
                }}
              />
            )}
          </View>
        ))
      }
      <Button
        title='Submit'
        onPress={
          () => {
            /* TODO: Submit for evaluation based on the answers provided / send to server */
          }
        }
      />
    </View>
  );
}