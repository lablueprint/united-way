"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface Choice {
  id: number;
  text: string;
  count: number;
}

interface Question {
  question: string;
  options: Choice[];
}

interface PollEditorProps {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function PollEditor({ activityId, timeStart, timeEnd }: PollEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [questionText, setQuestionText] = useState<string>("");
  const [choices, setChoices] = useState<Choice[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const activityData = await getActivityById(activityId);
      setQuestions(activityData.content);

      if (!activityData.content || activityData.content.length === 0) {
        setQuestionText("New Poll Question");
        setChoices([{ id: 1, text: "", count: 0 }]);
        setQuestionIndex(0);
      } else {
        const firstQuestion = activityData.content[0];
        setQuestionText(firstQuestion.question);
        setChoices(firstQuestion.options);
        setQuestionIndex(0);
      }
    };
    fetchQuestions();
  }, [activityId]);

  const getActivityById = async (activityID: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID}`
      );
      return response.data.data;
    } catch (err) {
      console.error(err);
      return { content: [] };
    }
  };

  const savePoll = async (updatedQuestions: Question[]) => {
    try {
      const response: AxiosResponse = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        {
          content: updatedQuestions,
          timeStart,
          timeEnd,
        }
      );
      const data = response.data.data;
      setQuestions(data.content);
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  const addQuestion = async () => {
    const newQuestion: Question = {
      question: "New Poll Question",
      options: [{ id: 1, text: "", count: 0 }],
    };
    const updatedQuestions = [...questions, newQuestion];
    const data = await savePoll(updatedQuestions);
    const idx = data.content.length - 1;
    setQuestionIndex(idx);
    setQuestionText(data.content[idx].question);
    setChoices(data.content[idx].options);
  };

  const deleteQuestion = async (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    const data = await savePoll(updatedQuestions);
    const nextIndex = updatedQuestions.length - 1 < index ? updatedQuestions.length - 1 : index;
    if (data.content.length > 0) {
      setQuestionIndex(nextIndex);
      setQuestionText(data.content[nextIndex].question);
      setChoices(data.content[nextIndex].options);
    } else {
      setQuestionText("New Poll Question");
      setChoices([{ id: 1, text: "", count: 0 }]);
    }
  };

  const handleUpdateQuestionText = async (text: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].question = text;
    setQuestionText(text);
    await savePoll(newQuestions);
  };

  const handleUpdateChoice = async (choiceIndex: number, value: string) => {
    const newChoices = [...choices];
    newChoices[choiceIndex].text = value;
    setChoices(newChoices);
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newChoices;
    await savePoll(newQuestions);
  };

  const handleAddChoice = async () => {
    const newChoice: Choice = {
      id: choices.length ? Math.max(...choices.map((c) => c.id)) + 1 : 1,
      text: "",
      count: 0,
    };
    const newChoices = [...choices, newChoice];
    setChoices(newChoices);
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newChoices;
    await savePoll(newQuestions);
  };

  const handleDeleteChoice = async (choiceIndex: number) => {
    const newChoices = [...choices];
    newChoices.splice(choiceIndex, 1);
    setChoices(newChoices);
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newChoices;
    await savePoll(newQuestions);
  };

  if (questions.length === 0) return <div />;

  return (
    <div>
      {questions.map((_, index) => (
        <button
          type="button"
          key={`nav-${index}`}
          onClick={() => {
            setQuestionIndex(index);
            setQuestionText(questions[index].question);
            setChoices(questions[index].options);
          }}
        >
          {index + 1}
        </button>
      ))}

      <div>
        <label>
          Question:
          <input
            type="text"
            value={questionText}
            onChange={(e) => handleUpdateQuestionText(e.target.value)}
          />
        </label>
      </div>

      {choices.map((choice, i) => (
        <div key={`choice-${i}`}>
          <input
            type="text"
            value={choice.text}
            onChange={(e) => handleUpdateChoice(i, e.target.value)}
          />
          <button type="button" onClick={() => handleDeleteChoice(i)}>
            Remove choice
          </button>
        </div>
      ))}

      <button type="button" onClick={handleAddChoice}>Add Choice</button>

      <button type="button" onClick={addQuestion}>Add Question</button>
      <button type="button" onClick={() => deleteQuestion(questionIndex)}>Delete Question</button>
    </div>
  );
}