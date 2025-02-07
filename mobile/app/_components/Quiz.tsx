import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';

interface QuizContent {
    title: string;
    choices: [string];
    answers: [number];
    singleSelect: boolean;
}

interface Activity {
    _id: string;
    eventID: string;
    type: string;
    content: unknown;
    timeStart: Date;
    timeEnd: Date;
    active: boolean;
}

interface Question {
    title: string;
    choices: [string];
    answers: [number];
    singleSelect: boolean;
  }

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

const styles = StyleSheet.create({
    buttonStyle: { 
        borderRadius: 100,
     },

}) 


export default function Quiz() {
    const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([]);
    const [activity, setActivity] = useState<Activity>();
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [singleSelect, setSingleSelect] = useState<boolean>();
    const [title, setTitle] = useState<string>();
    const [choices, setChoices] = useState<[string]>();
    const [answers, setAnswers] = useState<[number]>();
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    
    useEffect(() => {
        const fetchQuestions = async () => {
          const incomingActivity = await getActivityById("678ecb200b5f77523854b9f6");
          const activityData = incomingActivity.data;
          setActivity(activityData);
          setUpdatedQuestions(activityData.content);
          setQuestionIndex(0);
          setTitle(activityData.content[0].title);
          setChoices(activityData.content[0].choices);
          setAnswers(activityData.content[0].answers);
          setSingleSelect(activityData.content[0].singleSelect);
          setUserAnswers([]);
        };
        fetchQuestions();
      }, [/*activityID*/]);

    return (
    <View>
        {updatedQuestions.map((_, index) => {
          return (
            <Button
              title={`Question ${index + 1}`}
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
        <Text>{title}</Text>

        {/* EVERYTHING BELOW HERE SHOULD BE userAnswers */}
        
        {choices?.map((choice, choiceIndex) => (
          <View key={`choice-${choiceIndex}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Text style={{ marginRight: 10 }}>{choice}</Text>
            {singleSelect ? (
              <Button
              title={userAnswers.includes(choiceIndex) ? 'Selected' : 'Select'}
              onPress={() => {
                // For single select, always store only one answer.
                setUserAnswers([choiceIndex]);
              }}
            />
            ) : (
              <Button
                title={userAnswers.includes(choiceIndex) ? 'Selected' : 'Select'}
                onPress={() => {
                  const newAnswers = [...userAnswers];
                  if (userAnswers.includes(choiceIndex)) {
                    const idx = newAnswers.indexOf(choiceIndex);
                    if (idx > -1) {
                      newAnswers.splice(idx, 1);
                    }
                  } else {
                    newAnswers.push(choiceIndex);
                  }
                  setUserAnswers(newAnswers);
                }}
              />
            )}
          </View>
        ))}
        <Button
            title="Submit"
            onPress={() => {
              const correctAnswers = updatedQuestions[questionIndex].answers;
              const isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());
              if (isCorrect) {
                alert('Correct!');
              } else {
                alert('Incorrect!');
              }
            }}
        />
    </View>
    );
}