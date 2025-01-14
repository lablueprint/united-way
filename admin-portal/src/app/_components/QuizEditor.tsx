import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import EditCard from "./EditCard";

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  title: string;
  description: string;
  type: "single-select" | "multi-select";
  answers: Answer[];
}

interface QuizEditorProp {
  questions: Question[];
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
}

export default function QuizEditor({
  questions,
  onSave,
  onCancel,
}: QuizEditorProp) {
  const [updatedQuestions, setUpdatedQuestions] =
    useState<Question[]>(questions);

  const handleEditQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...updatedQuestions];
    newQuestions[index] = updatedQuestion;
    setUpdatedQuestions(newQuestions);
  };

  return (
    <div>
      {updatedQuestions.map((question, index) => (
        <EditCard
          key={index}
          index={index}
          question={question}
          handleEditQuestion={handleEditQuestion}
        />
      ))}
      <button onClick={onSave(updatedQuestions)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
