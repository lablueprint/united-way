import React, { useState, useEffect, FormEvent, MouseEvent } from "react";
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
import { useSelector } from 'react-redux';
import { RootState } from '../_interfaces/AuthInterfaces';

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
  const [activityIds, setActivityIds] = useState<string[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const org = useSelector((state: RootState) => { return { orgId: state.auth.orgId, authToken: state.auth.authToken, refreshToken: state.auth.refreshToken } });

  // Get the event details by ID
  const getEventById = async () => {
    try {
      const response: AxiosResponse = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/events/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${org.authToken}`
        }
      });
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

  const deleteActivityById = async (activityId: string) => {
    try {
      const response: AxiosResponse = await axios.delete(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`
      );
      const { data } = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

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

  // Activities retrieved by the card should only be for this particular event.
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

  // TODO: enable deletion and addition of an activity

  return (
    // Change all the element details to be the new information from the input fields after submit is pressed
    <>
      {/* <form onSubmit={handleSubmit}> */}
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
      Activities:
      <div>
        {activityIds.map((activityId) => (
          <div key={activityId}>
            {activityId}
            <button type="button" onClick={async () => {
              if (editingActivityId === activityId) {
                setEditingActivityId(null);
              } else {
                const activity = await getActivityById(activityId);
                if (activity.type === "quiz" && editingActivityId !== activityId) {
                  setEditingActivityId(activityId); // Set the currently editing activity ID
                }
              }
            }}>
              Edit Activity
            </button>
            <button type="button" onClick={() => { deleteActivityById(activityId) }}>
              Delete Activity
            </button>
          </div>
        ))}
      </div>

      {/* In consideration of other activity types, we need to be able to assess
                            the type of activity and return the correct editor to appear. */}
      {
        editingActivityId !== null ?
          // Some function is needed here to determine the editor based on the activity identifier.
          <QuizEditor
            activityId={editingActivityId}
          /> :
          <></>
      }
      {/* <input type="submit" value="Submit" /> */}
    </>
    // </form >
  );
}