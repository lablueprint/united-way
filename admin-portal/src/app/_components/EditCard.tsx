import React, { useState, useEffect, FormEvent } from "react";
import axios, { AxiosResponse } from "axios";
import QuizEditor from "./QuizEditor";

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

interface EditCardProps {
  id: string;
  handleCloseClick: () => void;
  handleEditEvent: (
    name: string,
    date: Date,
    description: string,
    tags: string[],
    questions: Question[]
  ) => void;
}

export default function EditCard({
  id,
  handleCloseClick,
  handleEditEvent,
}: EditCardProps) {
  // Variables to store the updated event details
  const [updatedName, setUpdatedName] = useState<string>("");
  const [updatedDate, setUpdatedDate] = useState<Date>(new Date());
  const [updatedDescription, setUpdatedDescription] = useState<string>("");
  const [updatedTags, setUpdatedTags] = useState<string[]>([]);
  const [updatedQuestions, setQuestions] = useState<Question[]>([]);

  // Get the event details by ID
  const getEventById = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`
      );
      const { data } = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return err;
    }
  };
  const getActivityById = async () => {
    try {
        const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${id}`);
        console.log("EditCard ActivityID", id);
        const { data } = response.data;
        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

  // Fetch the event details by ID
  useEffect(() => {
    const fetchData = async () => {
      const data = await getEventById();
      const activity = await getActivityById();
      setUpdatedName(data.name);
      setUpdatedDate(new Date(data.date));
      setUpdatedDescription(data.description);
      setUpdatedTags(data.tags || []);
      console.log('step 0', activity);
      setQuestions(activity);
    };
    fetchData();
  }, []);

  // Edit the event details
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      handleEditEvent(
        updatedName,
        updatedDate,
        updatedDescription,
        updatedTags,
        updatedQuestions
      );
      handleCloseClick();
    } catch (err) {
      console.log(err);
      handleCloseClick();
    }
  };

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

  const handleSave = (questions: Question[]) => {
    setQuestions(questions); // Update questions with the new values from QuizEditor
  };

  const handleCancel = () => {
    console.log("Cancel Editing");
  };

  const mockQuestions: Question[] = [
    { title: "What is React?", 
      description: "", 
      type: "single-select", 
      answers: [
        { text: "Answer A", correct: true },
        { text: "Answer B", correct: false },
        { text: "Answer C", correct: false },
        { text: "Answer D", correct: false },
    ] },
    { title: "Explain useState", 
      description: "", 
      type: "multi-select", 
      answers: [
          { text: "Answer A", correct: true },
          { text: "Answer B", correct: false },
          { text: "Answer C", correct: false },
          { text: "Answer D", correct: false },
      ] },
  ];


  return (
    // Change all the element details to be the new information from the input fields after submit is pressed
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={updatedName}
          onChange={(event) => {
            setUpdatedName(event.target.value);
          }}
        />
      </label>
      <label>
        Date:
        <input
          type="date"
          name="date"
          placeholder="Date"
          value={updatedDate ? updatedDate.toISOString().split("T")[0] : ""}
          onChange={(event) => {
            setUpdatedDate(new Date((event.target as HTMLInputElement).value));
          }}
        />
      </label>
      <label>
        Description:
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={updatedDescription}
          onChange={(event) => {
            setUpdatedDescription(event.target.value);
          }}
        />
      </label>
      <label>
        Tags:
        <input
          type="text"
          name="tags"
          placeholder="Tags"
          value={Array.isArray(updatedTags) ? updatedTags.join(", ") : ""}
          onChange={(event) => {
            setUpdatedTags(event.target.value.split(", "));
          }}
        />
      </label>
      <h3>Quiz</h3>
      <QuizEditor
        questions={updatedQuestions}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <input type="submit" value="Submit" />
    </form>
  );
}
