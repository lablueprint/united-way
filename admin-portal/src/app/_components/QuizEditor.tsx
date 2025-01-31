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

const editQuestion = async (title: string, choices: [string], answers: [number], singleSelect: boolean) => {
  try {
      const response: AxiosResponse = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
          {
              content: 
              [{
                title: title,
                choices: choices,
                answers: answers,
                singleSelect: singleSelect
              }]
          });
      const { data } = response.data;
      setActivity(data);
      setUpdatedQuestions(data.content);
  } catch (err) {
      console.log(err);
  }
}
  if (updatedQuestions.length <=0) {
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
          onClick={() =>  {
            setQuestionIndex(index);
            setTitle(updatedQuestions[index].title);
          }
        }
          />
        })
        
      }
      {
        questionIndex
      }
      {
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
      }
      {
        updatedQuestions[questionIndex].choices.map((choice, _) => {
          if (updatedQuestions[questionIndex].singleSelect == true) {
            return (
            <div key={`x${choice}`}>
              <input type="radio" id={choice} name="single"/>
              {choice}
            </div>
            )
          }
          else {
            return (
              <div key={`y${choice}`}>
                <input type="checkbox" id={choice} name = "multi"/>
                {choice}
              </div>
              )
          }
        })
      }
      {
        <>
          <button onClick={() => editQuestion(
            title || "",
            choices || [""],
            answers || [0],
            singleSelect || false,
            )}>
            Save
          </button>
          
            <button onClick={() => {
            setTitle((activity?.content as QuizContent[])[questionIndex].title);
            setChoices((activity?.content as QuizContent[])[questionIndex].choices);
            setAnswers((activity?.content as QuizContent[])[questionIndex].answers);
            setSingleSelect((activity?.content as QuizContent[])[questionIndex].singleSelect);
            }}>
            Cancel
            </button>  
        </>
      }
    </div>
    
  );
  
}
}
