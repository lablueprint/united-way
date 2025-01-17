import React, {useState} from "react";
import axios from 'axios';

interface Choices {
    id: number;
    text: string;
    count: number;
}

// interface Poll {
//     question: string;
//     options: Choices;
// }

interface Poll {
    questionData: string;
    answerData: Choices[];
}

export default function PollEditor({ questionData, answerData }: Poll)
{   
    const [answers, setAnswers] = useState<Choices[]>(answerData )
    const [question, setQuestion] = useState<string>(questionData)
    console.log(answers)
    console.log(question)
    const handleAnswerChange = (id: number,value: string) => {
        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
                answer.id == id ? {...answer, text: value} : answer
            ));
    };
    const handleQuestionChange = (value: string) => {
        setQuestion(value);
    }

    const handleDeleteAnswer = (id:number) => {
        setAnswers((prevAnswers)=> prevAnswers.filter((answer) => answer.id !== id));
    };

    const handleAddAnswer = () => {
        setAnswers((prevAnswers) => [
            ...prevAnswers,
            {id: prevAnswers.length + 1, text: "", count: 0}
        ]);
    };

    const handleSave = async () => {
        const now = new Date();
        const currentTimeISO = now.toISOString();

        const { data } = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/6785fa3aeee89e20063f6930/addActivity`, {
            activity: {
                type: "poll",
                content: {
                    question: question,
                    options: answers,
                },
                timeStart: currentTimeISO,
                timeEnd: currentTimeISO,
                active: true,
            },
        });

        console.log(data);
    }

    const handleCancel = () => {
        setQuestion("");
        setAnswers([{id:1, text: "", count: 0}]);
    }

    return(
        <div>
            <p>Question:</p>
            <input
                type = "text"
                value = {question}
                onChange={(event) => handleQuestionChange(event.target.value)}
                placeholder = "Enter a question"
            />
            <p>Answers:</p>
                {answers.map((answer) => (
                    <div key = {answer.id}>
                        <input
                            type = "text"
                            value = {answer.text}
                            onChange = {(event) => handleAnswerChange(answer.id, event.target.value)}
                        />
                        <button onClick = {() => handleDeleteAnswer(answer.id)}> x </button>
                    </div>
                    
                ))
                    
                }
                <button onClick = {handleAddAnswer}> Add Answer </button> 

            <button onClick = {handleSave}>Save</button> 
            <button onClick = {handleCancel}>Cancel</button>         
        </div>
    )
}