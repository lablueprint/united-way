"use client";
import React, { useState, useEffect } from "react";
import { Activity, QuizContent } from "../_interfaces/EventInterfaces";

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

interface Question {
  title: string;
  choices: string[];
  answers: number[];
  singleSelect: boolean;
}

interface QuizEditorProp {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function QuizEditor({ activityId, timeStart, timeEnd }: QuizEditorProp) {
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([]);
  const [activity, setActivity] = useState<Activity>();
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [singleSelect, setSingleSelect] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [choices, setChoices] = useState<string[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [org, sendRequest] = useApiAuth();

  useEffect(() => {
    const fetchQuestions = async () => {
      const activityData = await getActivityById(activityId);
      setActivity(activityData);
      setUpdatedQuestions(activityData.content);

      // If the contents of the activity is non-empty:
      if (!activity?.content) {
        // Set the information from the activity into the quiz editor.
        setQuestionIndex(0);
        setTitle(activityData.content[0].title);
        setChoices(activityData.content[0].choices);
        setAnswers(activityData.content[0].answers);
        setSingleSelect(activityData.content[0].singleSelect);
      } else {
        // Otherwise, we know that the quiz is empty and we provide default values.
        setQuestionIndex(0);
        setTitle("New Question Title");
        setChoices(["0"]);
        setAnswers([0]);
        setSingleSelect(true);
      }
    };
    fetchQuestions();
  }, [activityId]);

  const getActivityById = async (activityID: string) => {
    try {
      const body = {};
      const endpoint = `activities/${activityID}`;
      const requestType = RequestType.GET;
      return await sendRequest({ body, endpoint, requestType });
    } catch (err) {
      console.log(err);
      return err;
    }
  };

  const addQuestion = async (
    title: string,
    choices: string[],
    answers: number[],
    singleSelect: boolean
  ) => {
    try {
      const updatedQuestionsCopy = [...updatedQuestions];
      updatedQuestionsCopy.push({
        title: title,
        choices: choices,
        answers: answers,
        singleSelect: singleSelect,
      });

      const data: { content: Question[] } = await saveQuiz(updatedQuestionsCopy);
      const idx = data.content.length - 1;

      setQuestionIndex(idx);
      setTitle(data.content[idx].title);
      setChoices(data.content[idx].choices);
      setAnswers(data.content[idx].answers);
      setSingleSelect(data.content[idx].singleSelect);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteQuestion = async (questionIndex: number) => {
    try {
      const newQuestions = [...updatedQuestions];
      newQuestions.splice(questionIndex, 1);

      const data: { content: Question[] } = await saveQuiz(newQuestions);

      const nextIndex = newQuestions.length - 1 < questionIndex ? newQuestions.length - 1 : questionIndex;
      setQuestionIndex(nextIndex);
      setTitle(data.content[nextIndex].title);
      setChoices(data.content[nextIndex].choices);
      setAnswers(data.content[nextIndex].answers);
      setSingleSelect(data.content[nextIndex].singleSelect);
    } catch (err) {
      console.log(err);
    }
  }

  const saveQuiz = async (
    content: Question[]
  ) => {
    try {
      const body = {
        content: content,
        timeStart,
        timeEnd,
      };
      const endpoint = `activities/${activityId}`;
      const requestType = RequestType.PATCH;
      const data = await sendRequest({ body, endpoint, requestType });
      setActivity(data);
      setUpdatedQuestions(data.content);

      return data;
    } catch (err) {
      console.log(err);
    }
  };

  if (updatedQuestions.length <= 0) {
    return <div />;
  } else {
    return (
      <div>
        {
          updatedQuestions.map((_, index) => {
            return (
              <button
                type="button"
                style={{ height: "1rem", width: "1rem" }}
                key={`b${index}`}
                onClick={() => {
                  setQuestionIndex(index);
                  setTitle(updatedQuestions[index].title);
                  setChoices(updatedQuestions[index].choices);
                  setAnswers(updatedQuestions[index].answers);
                  setSingleSelect(updatedQuestions[index].singleSelect);
                }}
              />
            );
          })
        }
        {questionIndex}
        <div>
          <label>
            Question:
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                const newUpdatedQuestions = [...updatedQuestions];
                newUpdatedQuestions[questionIndex].title = event.target.value;
                saveQuiz(newUpdatedQuestions);
              }}
            />
          </label>
        </div>

        {/* Render the choices from the local state "choices" only */}
        {
          choices?.map((choice, choiceIndex) => (
            <div key={`choice-${choiceIndex}`}>
              <input
                type="text"
                value={choice}
                onChange={(event) => {
                  const newChoices = [...choices];
                  newChoices[choiceIndex] = event.target.value;
                  setChoices(newChoices);

                  const newUpdatedQuestions = [...updatedQuestions];
                  newUpdatedQuestions[questionIndex].choices = newChoices;
                  saveQuiz(newUpdatedQuestions);
                }}
              />
              <input
                type="checkbox"
                checked={answers?.includes(choiceIndex) || false}
                onChange={(event) => {
                  const newAnswers = [...answers];
                  if (event.target.checked) {
                    newAnswers.push(choiceIndex);
                  } else {
                    const idx = newAnswers.indexOf(choiceIndex);
                    if (idx > -1) {
                      newAnswers.splice(idx, 1);
                    }
                  }

                  setAnswers(newAnswers);
                  setSingleSelect(newAnswers.length <= 1);
                  const newUpdatedQuestions = [...updatedQuestions];
                  newUpdatedQuestions[questionIndex].singleSelect = newAnswers.length <= 1;
                  newUpdatedQuestions[questionIndex].answers = newAnswers;
                  saveQuiz(newUpdatedQuestions);
                }}
              />

              <button
                type="button"
                onClick={() => {
                  const newChoices = [...choices]
                  newChoices.splice(choiceIndex, 1);

                  const newAnswers = []
                  for (const answer of answers) {
                    if (answer > choiceIndex) {
                      newAnswers.push(answer - 1)
                    } else if (answer < choiceIndex) {
                      newAnswers.push(answer);
                    }
                  }

                  setChoices(newChoices);
                  setAnswers(newAnswers);

                  const newUpdatedQuestions = [...updatedQuestions];
                  newUpdatedQuestions[questionIndex].choices = newChoices;
                  newUpdatedQuestions[questionIndex].answers = newAnswers;
                  saveQuiz(newUpdatedQuestions);
                }}
              >
                Remove choice
              </button>
            </div>
          ))}

        {/* "Add Choice" Button */}
        <button
          type="button"
          onClick={() => {
            const newChoices = [...choices, ""];
            setChoices(newChoices);

            const newUpdatedQuestions = [...updatedQuestions];
            newUpdatedQuestions[questionIndex].choices = newChoices;
            saveQuiz(newUpdatedQuestions);
          }}
        >
          Add Choice
        </button>

        <>
          <button
            type="button"
            onClick={() =>
              addQuestion(
                "New Question Title", // Default title for the new question
                [""], // Default empty choices array
                [0], // Default empty answers array with one number
                true // Default singleSelect as true
              )
            }
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={() =>
              deleteQuestion(questionIndex)
            }
          >
            Delete Question
          </button>

        </>
      </div >
    );
  }
}
