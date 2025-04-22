"use client";
import React, { useState } from "react";
import axios from "axios";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import ActivityEditor from "./ActivityEditor";

interface EventActivityProps {
  eventId: string;
}

export default function ActivityCreator({ eventId }: EventActivityProps) {
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const start = new Date()
  const end = new Date()

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

      await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
        {
          eventID: eventId,
          type,
          content: defaultContent,
          timeStart: start,
          timeEnd: end,
          active: true,
        }
      );

      setMessage(`Created ${type} activity successfully!`);
      setRefresh((prev) => prev + 1);
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

      {message && <p>{message}</p>}

      <ActivityEditor id={eventId} refresh={refresh} />
    </div>
  );
}