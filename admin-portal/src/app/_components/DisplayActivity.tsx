"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Activity } from "../_interfaces/EventInterfaces";
import QuizEditor from "./QuizEditor";
import PollEditor from "./PollEditor";
import AnnouncementEditor from "./AnnouncementEditor";
import DateTimePicker from "react-datetime-picker";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DisplayActivityProps {
  id: string;
  refresh?: number;
}

export default function DisplayActivity({ id, refresh }: DisplayActivityProps) {
  const [start, setStart] = useState<Value>(new Date());
  const [end, setEnd] = useState<Value>(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const fetchActivities = async () => {
    try {
      const { data } = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
        { eventID: id }
      );
      setActivities(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [id, refresh]);

  useEffect(() => {
    if (selectedActivity) {
      setStart(new Date(selectedActivity.timeStart));
      setEnd(new Date(selectedActivity.timeEnd));
    }
  }, [selectedActivity]);

  const updateActivityTime = async (newStart: Date, newEnd: Date) => {
    if (!selectedActivity) return;

    try {
      await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${selectedActivity._id}`,
        { timeStart: newStart, timeEnd: newEnd }
      );
      
      fetchActivities(); 
      setSelectedActivity({
        ...selectedActivity,
        timeStart: newStart,
        timeEnd: newEnd,
      });
    } catch (err) {
      console.error("Failed to update time:", err);
    }
  };

  const handleTimeChange = (newValue: Value, isStart: boolean) => {
    if (!newValue || !selectedActivity) return;
    const newDate = Array.isArray(newValue) ? newValue[0] : newValue;

    if (newDate) {
      if (isStart) {
        setStart(newDate);
        updateActivityTime(newDate, end as Date);
      } else {
        setEnd(newDate);
        updateActivityTime(start as Date, newDate);
      }
    }
  };

  const renderEditor = () => {
    if (!selectedActivity) return null;

    return (
      <>
        <div style={{ marginTop: "20px" }}>
          <h3>Set Activity Duration</h3>
          <DateTimePicker
            onChange={(value) => handleTimeChange(value, true)}
            value={start}
          />
          <DateTimePicker
            onChange={(value) => handleTimeChange(value, false)}
            value={end}
          />
        </div>

        {selectedActivity.type === "quiz" && (
          <>
            <h3>Quiz Editor</h3>
            <QuizEditor
              activityId={selectedActivity._id}
              timeStart={start as Date}
              timeEnd={end as Date}
            />
          </>
        )}
        {selectedActivity.type === "poll" && (
          <>
            <h3>Poll Editor</h3>
            <PollEditor
              activityId={selectedActivity._id}
              timeStart={start as Date}
              timeEnd={end as Date}
            />
          </>
        )}
        {selectedActivity.type === "announcement" && (
          <>
            <h3>Announcement Editor</h3>
            <AnnouncementEditor
              activityId={selectedActivity._id}
              timeStart={start as Date}
              timeEnd={end as Date}
            />
          </>
        )}
      </>
    );
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