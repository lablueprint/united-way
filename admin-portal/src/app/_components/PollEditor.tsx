import React, { useState } from "react";
import axios from "axios";

interface Choice {
    id: number;
    text: string;
    count: number;
}

interface Question {
    id: number;
    question: string;
    answers: Choice[];
}

interface PollProps {
    eventID: string;
    idData: number | null;
    questionsData: Question[];
    onSave: () => void;
}

export default function PollEditor({ eventID, idData, questionsData, onSave }: PollProps) {
    const [questions, setQuestions] = useState<Question[]>(questionsData || []);

    const handleQuestionChange = (id: number, value: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) => (q.id === id ? { ...q, question: value } : q))
        );
    };

    const handleAnswerChange = (questionId: number, answerId: number, value: string) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          answers: q.answers.map((a) =>
                              a.id === answerId ? { ...a, text: value } : a
                          ),
                      }
                    : q
            )
        );
    };

    const handleAddQuestion = () => {
        setQuestions((prevQuestions) => [
            ...prevQuestions,
            {
                id: prevQuestions.length ? Math.max(...prevQuestions.map((q) => q.id)) + 1 : 1,
                question: "",
                answers: [{ id: 1, text: "", count: 0 }],
            },
        ]);
    };

    const handleAddAnswer = (questionId: number) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          answers: [
                              ...q.answers,
                              {
                                  id: q.answers.length
                                      ? Math.max(...q.answers.map((a) => a.id)) + 1
                                      : 1,
                                  text: "",
                                  count: 0,
                              },
                          ],
                      }
                    : q
            )
        );
    };

    const handleDeleteAnswer = (questionId: number, answerId: number) => {
        setQuestions((prevQuestions) =>
            prevQuestions.map((q) =>
                q.id === questionId
                    ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) }
                    : q
            )
        );
    };

    const handleDeleteQuestion = (questionId: number) => {
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== questionId));
    };

    const handleSave = async () => {
        console.log(idData);
        try {
          const poll = {
            eventID,
            type: "poll",
            content: questions.map((q) => ({
              question: q.question,
              options: q.answers,
            })),
          };
      
          const { data } = await axios.post(
            `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
            poll
          );
      
          console.log("Response:", data);
          onSave();
        } catch (error) {
          console.error("Error saving activity:", error);
        }
      };
      

    return (
        <div>
            {questions.map((question) => (
                <div key={question.id} className="question-block">
                    <p>Question:</p>
                    <input
                        type="text"
                        value={question.question}
                        onChange={(event) => handleQuestionChange(question.id, event.target.value)}
                        placeholder="Enter a question"
                    />
                    <p>Answers:</p>
                    {question.answers.map((answer) => (
                        <div key={answer.id}>
                            <input
                                type="text"
                                value={answer.text}
                                onChange={(event) =>
                                    handleAnswerChange(question.id, answer.id, event.target.value)
                                }
                                placeholder="Enter an answer"
                            />
                            <button
                                type="button"
                                onClick={() => handleDeleteAnswer(question.id, answer.id)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddAnswer(question.id)}>
                        Add Answer
                    </button>
                    <button type="button" onClick={() => handleDeleteQuestion(question.id)}>
                        Delete Question
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={handleAddQuestion}
                style={{ marginTop: "20px", backgroundColor: "#28a745", color: "white" }}
            >
                Add Question
            </button>
            <button
                type="button"
                onClick={handleSave}
                style={{ marginTop: "20px", backgroundColor: "#007BFF", color: "white" }}
            >
                Save Poll
            </button>
        </div>
    );
}


// import React, {useState} from "react";
// import axios /*,{AxiosResponse}*/ from 'axios';

// interface Choices {
//     id: number;
//     text: string;
//     count: number;
// }

// interface Poll {
//     eventID: string;
//     idData: number;
//     questionData: string;
//     answerData: Choices[];
//     onSave: ()=>void;
// }

// export default function PollEditor({ eventID, idData, questionData, answerData, onSave }: Poll)
// {   
//     const [answers, setAnswers] = useState<Choices[]>(answerData);
//     const [question, setQuestion] = useState<string>(questionData);
//     const [pollID, setPollID] = useState<number|null>(idData || null);
    
//     const handleAnswerChange = (id: number,value: string) => {
//         setAnswers((prevAnswers) =>
//             prevAnswers.map((answer) =>
//                 answer.id == id ? {...answer, text: value} : answer
//             ));
//     };
//     const handleQuestionChange = (value: string) => {
//         setQuestion(value);
//     }

//     const handleDeleteAnswer = (id:number) => {
//         setAnswers((prevAnswers)=> prevAnswers.filter((answer) => answer.id !== id));
//     };

//     const handleAddAnswer = () => {
//         console.log(answers)
//         setAnswers((prevAnswers) => [
//             ...prevAnswers,
//             {id: prevAnswers.length + 1, text: "", count: 0}
//         ]);
//         console.log(answers)
        
//     };

//     const handleSave = async () => {
//         //const now = new Date();
//         //const currentTimeISO = now.toISOString();

//         if (!pollID)
//         {
//             const payload = {
//                 eventID,
//                 type: "poll",
//                 content: [
//                   {
//                     question: question,
//                     options: answers,
//                   },
//                 ],
//                 timeStart: new Date().toISOString(), // Replace with actual start time
//                 timeEnd: new Date().toISOString(), // Replace with actual end time
//                 active: true, // Or any desired default value
//               };
            
//               try {
//                 const { data } = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`, payload);
//                 console.log("Activity saved:", data);
//               } catch (error) {
//                 console.error("Error saving activity:", error);
//               }
//             // const { data } = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`, {
//             //     eventID: eventID,
//             //     type: "poll",
//             //     content: [{
                    
//             //             question: question,
//             //             options: answers,
                    
//             //     }],
//             // });
//             // console.log(data);
//             // setPollID(data.pollID);

//         }
//         else {
//             const { data } = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${idData}`, {
//                 content: [{
//                     question: question,
//                     options: answers,
//                 }],
//             });
//             console.log(data);
//         }
        
//         onSave();
//         setQuestion("");
//         setAnswers([{id: 0, text: "", count: 0}]);
//     }

//     // const handleEdit = async (question: string, options: Choices[]) => {
//     //     const { data } = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${idData}`, {
//     //         content: {
//     //             question: question,
//     //             options: options,
//     //         },
//     //     });

//     //     console.log(data);
//     // }

//     const handleCancel = () => {
//         setQuestion("");
//         setAnswers([{id:1, text: "", count: 0}]);
//     }

//     return(
//         <div>
//             <p>Question:</p>
//             <input
//                 type = "text"
//                 value = {question}
//                 onChange={(event) => handleQuestionChange(event.target.value)}
//                 placeholder = "Enter a question"
//             />
//             <p>Answers:</p>
//                 {answers.map((answer) => (
//                     <div key = {answer.id}>
//                         <input
//                             type = "text"
//                             value = {answer.text}
//                             onChange = {(event) => handleAnswerChange(answer.id, event.target.value)}
//                         />
//                         <button onClick = {() => handleDeleteAnswer(answer.id)}> x </button>
//                     </div>
                    
//                 ))
                    
//                 }

//             <button type="button" onClick = {handleAddAnswer}> Add Answer </button>
//             <button type="button" onClick = {handleSave}>Save</button> 
//             <button type="button" onClick = {handleCancel}>Cancel</button>
//             {/*<button type="button" onClick = {() => handleEdit(question, answers)}>Edit</button>  */}       
//         </div>
//     )
// }