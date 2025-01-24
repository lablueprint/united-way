import React, { useState, useEffect, FormEvent } from "react";
import axios, { AxiosResponse } from "axios";
import QuizEditor from "./QuizEditor";
import { Activity } from "../_interfaces/EventInterfaces";

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
  const [activityIds, setActivityIds] = useState<string[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

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

  const getActivityById = async (activityId: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`
      );
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
      setUpdatedName(data.name);
      setUpdatedDate(new Date(data.date));
      setUpdatedDescription(data.description);
      setUpdatedTags(data.tags || []);
      setActivityIds(data.activity || []);
    };
    fetchData(); 
  }, []);

const getActivitiesByFilter = async () => {
    try {
        const response: AxiosResponse = await axios.get('http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/');
        const { data } = response.data;
        return data;
    } catch (err) {
        console.log(err);
        return err;
    }
};

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
      <br/>
      <label>
        Activities:
        <ul>
        {activityIds.map((activityId) => (
          <li key={activityId}>
            {activityId}
          <button type="button" onClick={async () => {
            const activity = await getActivityById(activityId);
            if (activity.type === "quiz") {
              setQuestions(activity.questions || []);
              setEditingActivityId(activityId); // Set the currently editing activity ID
            }
          }}>
            Edit Activity
          </button>
          {editingActivityId === activityId && (
            <QuizEditor
              activityId = {activityId}
            />
          )}
          </li>
        ))}
        </ul>
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}
