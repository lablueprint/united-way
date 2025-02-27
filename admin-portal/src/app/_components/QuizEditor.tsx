import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Activity, QuizContent } from "../_interfaces/EventInterfaces";
import EditCard from "./EditCard";

interface Question {
  title: string;
  choices: [string];
  answers: [number];
  singleSelect: boolean;
}

interface QuizEditorProp {
  activityId: string;
}

export default function QuizEditor({ activityId }: QuizEditorProp) {
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([]);
  const [activity, setActivity] = useState<Activity>();
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [singleSelect, setSingleSelect] = useState<boolean>();
  const [title, setTitle] = useState<string>();
  const [choices, setChoices] = useState<[string]>();
  const [answers, setAnswers] = useState<[number]>();

  useEffect(() => {
    const fetchQuestions = async () => {
      const activityData = await getActivityById(activityId);
      setActivity(activityData);
      setUpdatedQuestions(activityData.content);
      console.log(activityData.content);
      setQuestionIndex(0);
      setTitle(activityData.content[0].title);
      setChoices(activityData.content[0].choices);
      setAnswers(activityData.content[0].answers);
      setSingleSelect(activityData.content[0].singleSelect);
    };
    fetchQuestions();
  }, [activityId]);

  const getActivityById = async (activityID: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID}`
      );
      const { data } = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return err;
    }
  };

  const addQuestion = async (
    title: string,
    choices: [string],
    answers: [number],
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

      const response: AxiosResponse = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        {
          content: updatedQuestionsCopy,
        }
      );
      const { data } = response.data;
      setActivity(data);
      setUpdatedQuestions(data.content);
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

  const editQuestion = async (
    title: string,
    choices: [string],
    answers: [number],
    singleSelect: boolean
  ) => {
    try {
      const updatedQuestionsCopy = [...updatedQuestions];
      updatedQuestionsCopy[questionIndex] = {
        title: title,
        choices: choices,
        answers: answers,
        singleSelect: singleSelect,
      };

      const response: AxiosResponse = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        {
          content: updatedQuestionsCopy,
        }
      );
      const { data } = response.data;
      setActivity(data);
      setUpdatedQuestions(data.content);
    } catch (err) {
      console.log(err);
    }
  };

  // TODO: enable deletion of particular choices and questions.

  if (updatedQuestions.length <= 0) {
    return <div />;
  } else {
    return (
      <div>
        {
          updatedQuestions.map((_, index) => {
            return (
              <button
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
              }}
            />
          </label>
        </div>

        {/* Render the choices from the local state "choices" only */}
        {choices?.map((choice, choiceIndex) => (
          <div key={`choice-${choiceIndex}`}>
            <input
              type="text"
              value={choice}
              onChange={(event) => {
                const newChoices = [...(choices || [])];
                newChoices[choiceIndex] = event.target.value;
                setChoices(newChoices as [string]);
              }}
            />
            <input
              type="checkbox"
              checked={answers?.includes(choiceIndex) || false}
              onChange={(event) => {
                const newAnswers = [...(answers || [])];
                if (event.target.checked) {
                  newAnswers.push(choiceIndex);
                } else {
                  const idx = newAnswers.indexOf(choiceIndex);
                  if (idx > -1) {
                    newAnswers.splice(idx, 1);
                  }
                }
                setAnswers(newAnswers as [number]);
                console.log(
                  "this is to see newAnswers.length",
                  newAnswers.length
                );
                setSingleSelect(newAnswers.length <= 1);
              }}
            />
          </div>
        ))}

        {/* "Add Choice" Button */}
        <button
          onClick={() => {
            const newChoices = [...(choices || []), ""];
            setChoices(newChoices as [string]);
          }}
        >
          Add Choice
        </button>

        <>
          <button
            onClick={() =>
              editQuestion(
                title || "",
                choices || [""],
                answers || [0],
                (answers?.length || 0) <= 1
              )
            }
          >
            Save
          </button>

          <button
            onClick={() => {
              setTitle(
                (activity?.content as QuizContent[])[questionIndex].title
              );
              setChoices(
                (activity?.content as QuizContent[])[questionIndex].choices
              );
              setAnswers(
                (activity?.content as QuizContent[])[questionIndex].answers
              );
              setSingleSelect(
                (activity?.content as QuizContent[])[questionIndex].singleSelect
              );
            }}
          >
            Cancel
          </button>

          <button
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

        </>
      </div>
    );
  }
}
