"use client";
import React, { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import axios from "axios";
import { Activity } from "../_interfaces/EventInterfaces";
import QuizEditor from "./QuizEditor";
import AnnouncementEditor from "./AnnouncementEditor";
import PollEditor from "./PollEditor";
import DisplayActivity from "./DisplayActivity";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";

interface EventActivityProps {
  id: string;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CreateActivity({ id }: EventActivityProps) {
  const [start, setStart] = useState<Value>(new Date());
  const [end, setEnd] = useState<Value>(new Date());
  const [message, setMessage] = useState("");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); //

  const createAct = async (type: string) => {
    try {
      const defaultContent =
        type === "announcement"
          ? [{ text: "New Announcement" }]
          : type === "quiz"
          ? [
              {
                title: "New Question Title",
                choices: ["0"],
                answers: [0],
                singleSelect: true,
              },
            ]
          : type === "poll"
          ?
            [
              {
                question: "New Poll Question",
                options: [
                  { id: 0, text: "Option 1", count: 0 },
                ]
              },
            ]
          : "";

      const { data } = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
        {
          eventID: id,
          type,
          content: defaultContent,
          timeStart: start,
          timeEnd: end,
          active: true,
        }
      );

      setActivity(data.data);
      setMessage(`Created ${type} activity successfully!`);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setMessage("Error creating activity");
    }
  };

  const handleDropdownChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newType = e.target.value;
    if (newType) {
      await createAct(newType);
      e.target.value = "";
    }
  };

  const updateActivityTime = async (newStart: Date, newEnd: Date) => {
    if (!activity) return;

    try {
      const { data } = await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activity._id}`,
        { timeStart: newStart, timeEnd: newEnd }
      );

      setActivity({ ...activity, timeStart: newStart, timeEnd: newEnd });
      setMessage("Activity time updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Error updating activity time");
    }
  };

  const handleTimeChange = (newValue: Value, isStart: boolean) => {
    if (!newValue || !activity) return;
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

  return (
    <div>
      <h2>Create New Activity</h2>
      <label htmlFor="activityType">Choose an activity (auto-create):</label>
      <select id="activityType" onChange={handleDropdownChange} defaultValue="">
        <option value="">-- Select Activity --</option>
        <option value="announcement">Announcement</option>
        <option value="poll">Poll</option>
        <option value="quiz">Quiz</option>
        <option value="raffle">Raffle</option>
      </select>

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

      {message && <p>{message}</p>}

      <DisplayActivity id={id} refreshKey={refreshKey} />

      {activity && (
        <div style={{ marginTop: "20px" }}>
          {activity.type === "quiz" ? (
            <>
              <h2>Quiz Editor</h2>
              <QuizEditor
                activityId={activity._id}
                timeStart={new Date(activity.timeStart)}
                timeEnd={new Date(activity.timeEnd)}
              />
            </>
          ) : activity.type === "announcement" ? (
            <>
              <h2>Announcement Editor</h2>
              <AnnouncementEditor
                activityId={activity._id}
                timeStart={new Date(activity.timeStart)}
                timeEnd={new Date(activity.timeEnd)}
              />
            </>
          ) : activity.type === "poll" ? (
            <>
              <h2>Poll Editor</h2>
              <PollEditor
                activityId={activity._id}
                timeStart={new Date(activity.timeStart)}
                timeEnd={new Date(activity.timeEnd)}
              />
            </>
          ) : (
            <p>Editor for this activity type is not yet implemented.</p>
          )}
        </div>
      )}
    </div>
  );
}