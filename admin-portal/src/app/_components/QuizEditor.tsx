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
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      const activityData = await getActivityById(activityId);
      setActivity(activityData);
      setUpdatedQuestions(activityData.content);
      console.log(activityData);
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
  // console.log("updated questions @ index :p", updatedQuestions[0]);
  // console.log("updated questions choices ", updatedQuestions[questionIndex].choices[0]);
  if(updatedQuestions.length <=0) {
    return <div />;
  }
  
  else {
  return (    
    <div>
      {
        updatedQuestions.map((_, index) => {
          return <button 
          style = {
            {
              height: "1rem",
              width: "1rem"
            }
          }
          
          key ={`b${index}`}
          onClick={() => setQuestionIndex(index)}
          />
        })
        
      }
      {
        questionIndex
      }
      {
        
        updatedQuestions[questionIndex].choices.map((choice, _) => {
          return (
          <div key={`🫠${choice}`}>
            {choice}
          </div>)
        })
      }
    </div>
    
  );
  
}
}

