import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Activity, QuizContent } from '../_interfaces/EventInterfaces';
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

export default function QuizEditor({
  activityId
}: QuizEditorProp) {
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>([]);
  const [activity, setActivity] = useState<Activity>();

  useEffect(() => {
    const fetchQuestions = async () => {
      const activityData = await getActivityById(activityId);
      setActivity(activityData);
      setUpdatedQuestions(activityData.content);
    };

    fetchQuestions();
  }, [activityId]);

  const getActivityById = async (activityID :string) => {
    try {
        const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID}`);
        const { data } = response.data;
        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

  const handleEditQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = updatedQuestions ? [...updatedQuestions] : [];
    newQuestions[index] = updatedQuestion;
    setUpdatedQuestions(newQuestions);
  };

  return (
    // <div className = "quiz-editor">
    //   <div className = "sidebar">
    //     {updatedQuestions.map((_,index) => (
      //       <button
      //          key={index}
      //          onClick={() => setCurrentQuestion(index)}
      //          className={currentQuestionIndex == index ? "active" : ""} 
      //          >
      //           Question {index + 1}
    //         </button>
    //     ))}
    //   </div>
    // </div>
    
      <div>
        <h2>Hello :o</h2>
        {updatedQuestions.map((_, index) => (
          <h3>
            Question {index + 1}
          </h3>
          
        ))}
      </div>
    
  );
}

