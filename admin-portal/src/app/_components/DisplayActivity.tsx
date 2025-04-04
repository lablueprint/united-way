"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Activity } from "../_interfaces/EventInterfaces";
import QuizEditor from "./QuizEditor";
import PollEditor from "./PollEditor";
import AnnouncementEditor from "./AnnouncementEditor";

interface DisplayActivityProps {
  id: string;
  refreshKey?: number;
}

export default function DisplayActivity({id, refreshKey} : DisplayActivityProps){
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await axios.post(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
          {
            eventID: id,
          }
        );
  
        setActivities(data.data);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchActivities();
  }, [id, refreshKey]);

  const renderEditor = () => {
    if (!selectedActivity) return null;

    const start = new Date(selectedActivity.timeStart);
    const end = new Date(selectedActivity.timeEnd);

    switch (selectedActivity.type) {
      case "quiz":
        return (
          <>
            <h3>Quiz Editor</h3>
            <QuizEditor
              activityId={selectedActivity._id}
              timeStart={start}
              timeEnd={end}
            />
          </>
        );
      case "poll":
        return (
          <>
            <h3>Poll Editor</h3>
            <PollEditor
              activityId={selectedActivity._id}
              timeStart={start}
              timeEnd={end}
            />
          </>
        );
      case "announcement":
        return (
          <>
            <h3>Announcement Editor</h3>
            <AnnouncementEditor
              activityId={selectedActivity._id}
              timeStart={start}
              timeEnd={end}
            />
          </>
        );
      default:
        return <p>No editor available for this activity type.</p>;
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>All Activities</h2>
      {activities.length === 0 ? (
        <p>No activities found for this event.</p>
      ) : (
        <ul>
          {activities.map((act) => (
            <li key={act._id} style={{ marginBottom: "10px" }}>
              <strong>{act.type.toUpperCase()}</strong> | Start:{" "}
              {new Date(act.timeStart).toLocaleString()} | End:{" "}
              {new Date(act.timeEnd).toLocaleString()}
              <button
                type="button"
                style={{ marginLeft: "10px" }}
                onClick={() => setSelectedActivity(act)}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "30px" }}>{renderEditor()}</div>
    </div>
  );
}