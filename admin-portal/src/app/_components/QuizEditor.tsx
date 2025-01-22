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

// const deleteEvent = async () => {
//   try {
//       removeFromList(id);
//       await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`);
//   } catch (err) {
//       console.log(err);
//   }
// };


// const editEvent = async (name: string, date: Date, description: string, tags: string[]) => {
//   try {
//       const response: AxiosResponse = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`,
//           {
//               name: name,
//               date: date,
//               description: description,
//               tags: tags
//           });
//       const { data } = response.data;
//       setEventData(data);
//   } catch (err) {
//       console.log(err);
//   }
// }

// const getEventById = async () => {
//   try {
//       const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`);
//       const { data } = response.data;
//       return data;
//   } catch (err) {
//       console.log(err);
//       return err;
//   }
// };

// useEffect(() => {
//   const fetchData = async () => {
//       const data = await getEventById();
//       setEventData(data);
//   };
//   fetchData();
// }, []);

export default function QuizEditor({
  questions,
  onSave,
  onCancel,
}: QuizEditorProp) {
  const [updatedQuestions, setUpdatedQuestions] = useState<Question[]>(questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const handleEditQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...updatedQuestions];
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
      <div
        className="sidebar"
        style={{
          width: "200px",
          background: "#ff0000",
          padding: "10px",
          borderRight: "1px solid #ddd",
        }}
      >
    {updatedQuestions.map((question, questionIndex) => (
    <div
      key={questionIndex}
      onClick={() => setCurrentQuestionIndex(questionIndex)}
      style={{
        display: "block",
        margin: "5px 0",
        padding: "10px",
        background: currentQuestionIndex === questionIndex ? "#000" : "#000",
        border: "1px solid #ccc",
      }}
    >
      <h3>{`Question ${questionIndex + 1}`}</h3>
      <p>{question.title || "No title available"}</p>
      <ul>
        {question.answers.map((answer, answerIndex) => (
          <>
          <div
            key={answerIndex}
            onClick={(e) => {
              e.stopPropagation(); // Prevent question selection when clicking on an answer
              const updatedQuestionsCopy = [...updatedQuestions];

              // Handle Single-Select or Multi-Select Logic
              if (question.type === "single-select") {
                // Ensure only one answer is correct
                updatedQuestionsCopy[questionIndex].answers = updatedQuestionsCopy[questionIndex].answers.map((a, i) => ({
                  ...a,
                  correct: i === answerIndex, // Set only the clicked answer as correct
                }));
              } else if (question.type === "multi-select") {
                // Toggle the correct state of the clicked answer
                updatedQuestionsCopy[questionIndex].answers[answerIndex].correct =
                  !updatedQuestionsCopy[questionIndex].answers[answerIndex].correct;
              }

              setUpdatedQuestions(updatedQuestionsCopy);
            }}
            style={{
              padding: "10px 15px",
              borderRadius: "20px",
              background: answer.correct ? "#4CAF50" : "#f0f0f0",
              color: answer.correct ? "#fff" : "#000",
              border: "1px solid #ccc",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {answer.text || "No answer text"}
          </div>
          <button>Edit</button>
          </>
        ))}

      </ul>
    </div>
  ))}
  </div>
      <div>
        <h3>Testing QuizEditor Print</h3>
        <button onClick={() => onSave(updatedQuestions)}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

