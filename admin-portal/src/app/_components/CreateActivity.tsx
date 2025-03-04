"use client"
import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import axios from "axios";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

interface EventActivityProps {
  id: string;
}


type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CreateActivity({ id }: EventActivityProps) {
  const [activityType, setActivityType] = useState("");
  const [start, setStart] = useState<Value>(new Date());
  const [end, setEnd] = useState<Value>(new Date());

  const createActivity = async () => {
    try {
      const { data } = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
        {
            id,
            type: activityType,
            content: newPollContent,
            timeStart: start,
            timeEnd: end,
            active: true,
        }
      );
    } catch (err) {
      console.log(err);
      return err;
    }
  };

  const renderEditor = () => {
    switch (activityType) {
      case "announcement":
        
      case "poll":
        
      case "quiz":
        
      case "raffle":

    }
  };

  return (
    <div>
      <h2>Event Activity Editor</h2>
      <label htmlFor="activityType">Choose an activity:</label>
      <select
        id="activityType"
        value={activityType}
        onChange={(e) => setActivityType(e.target.value)}
      >
        <option value="">-- Select Activity --</option>
        <option value="announcement">Announcement</option>
        <option value="poll">Poll</option>
        <option value="quiz">Quiz</option>
        <option value="raffle">Raffle</option>
      </select>
      <div style={{ marginTop: "20px" }}>{renderEditor()}</div>

      <div style={{ marginTop: "20px" }}>
        <h2>Set Activity Duration</h2>
          <DateTimePicker onChange={setStart} value={start} />
          <DateTimePicker onChange={setEnd} value={end} />
      </div>
    </div>
  );
}
