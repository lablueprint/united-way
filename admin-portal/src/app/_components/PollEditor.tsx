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
    console.log("hrlloooooo")
    console.log(questions)

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

    // const handleSave = async () => {
    //     const now = new Date();
    //     const currentTimeISO = now.toISOString();
    //     console.log("Sending poll data:", { idData, eventID, questions });
      
    //     try {
    //       // Prepare the poll data to be sent to the backend
    //       const poll = {
    //         content: questions.map((q) => ({
    //           question: q.question,
    //           options: q.answers,
    //         }))
    //       };
      
    //       // If we have an existing activityId, we should update it
    //       if (idData) {
    //         console.log("there is a existing activityID");
    //         // Assume that `idData` is the ID of the activity to be updated
    //         const existingActivity = await axios.get(
    //           `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${idData}`
    //         );
      
    //         // Check if activity already contains a poll, and update it
    //         if (existingActivity.data && existingActivity.data.content) {
    //           // Append new poll to existing content
    //           existingActivity.data.content.push(...poll.content);
      
    //           // Now send the updated content array to the backend
    //           const { data } = await axios.patch(
    //             `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${idData}`,
    //             { content: existingActivity.data.content }
    //           );
      
    //           console.log("Activity updated with new poll:", data);
    //           onSave(); // Call your save callback
    //         } else {
    //             console.log("NOOO existing ID");
    //           // If no existing poll, just create a new one
    //           const { data } = await axios.post(
    //             `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
    //             {
    //               eventID,
    //               type: "poll",
    //               content: poll.content,
    //               timeStart: currentTimeISO,
    //               timeEnd: currentTimeISO,
    //               active: true,
    //             }
    //           );
      
    //           console.log("New poll activity created:", data);
    //           onSave(); // Call your save callback
    //         }
    //       } else {
    //         console.log("second else");
    //         // If no `idData`, create a new poll (new activity)
    //         const { data } = await axios.post(
    //           `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
    //           {
    //             eventID,
    //             type: "poll",
    //             content: poll.content,
    //             timeStart: currentTimeISO,
    //             timeEnd: currentTimeISO,
    //             active: true,
    //           }
    //         );
      
    //         console.log("New poll activity created:", data);
    //         onSave(); // Call your save callback
    //       }
    //     } catch (error) {
    //       console.error("Error saving activity:", error);
    //     }
    // };

    const handleSave = async () => {
        const now = new Date();
        const currentTimeISO = now.toISOString();
        console.log("Sending poll data:", { idData, eventID, questions });
    
        try {
            // Prepare the new poll data to be added
            const newPollContent = questions.map((q) => ({
                question: q.question,
                options: q.answers,
            }));
            
            if (idData) {
                console.log("Updating existing poll with ID:", idData);

                console.log("Existing activity content:", questionsData);
                console.log("newPollContent" + newPollContent);
    
                if (questionsData) {
                    // Merge the new questions with the existing ones (avoid duplicates)
                    const updatedContent = [
                        //...questionsData, // Keep existing questions
                        ...newPollContent, // Add new ones
                    ];

                    console.log("Updated Content ", updatedContent);
    
                    // Update the existing poll with the merged content
                    await axios.patch(
                        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${idData}`,
                        { content: updatedContent }
                    );

                    console.log("New question data", questionsData);
    
                    console.log("Poll successfully updated with new questions!");
                }
            } else {
                console.log("Creating a new poll activity");
    
                // Create a new poll activity
                const { data } = await axios.post(
                    `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
                    {
                        eventID,
                        type: "poll",
                        content: newPollContent,
                        timeStart: currentTimeISO,
                        timeEnd: currentTimeISO,
                        active: true,
                    }
                );
    
                console.log("New poll activity created:", data);
            }
    
            onSave(); // Fetch updated polls after saving
        } catch (error) {
            console.error("Error saving activity:", error);
        }
    };
    
      

    // const handleSave = async () => {
    //     console.log(idData);
    //     try {
    //       const poll = {
    //         eventID,
    //         type: "poll",
    //         content: questions.map((q) => ({
    //           question: q.question,
    //           options: q.answers,
    //         })),
    //       };
      
    //       const { data } = await axios.post(
    //         `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
    //         poll
    //       );
      
    //       console.log("Response:", data);
    //       onSave();
    //     } catch (error) {
    //       console.error("Error saving activity:", error);
    //     }
    // };

    return (
        <div>
            {questions.map((question) => (
                <div key={question.id} className="question-block">
                    <p>Question:</p>
                    <h1>{question.id}</h1>
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