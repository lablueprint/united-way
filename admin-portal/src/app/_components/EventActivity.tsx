"use client"
import React, { useState } from 'react';
import AnnouncementEditor from '@/app/_components/AnnouncementEditor';
import PollEditor from '@/app/_components/PollEditor';
import QuizEditor from '@/app/_components/QuizEditor';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

function RaffleEditor() {
  return <div>Raffle Editor: Set up your raffle details here!</div>;
}

interface EventActivityProps {
  id: string;
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function EventActivity({ id }: EventActivityProps) {
  const [activityType, setActivityType] = useState("");
  const [start, setStart] = useState<Value>(new Date());
  const [end, setEnd] = useState<Value>(new Date());

  const renderEditor = () => {
    switch (activityType) {
      case "announcement":
        return <AnnouncementEditor
          id={id}
          timeStart={start instanceof Date ? start : new Date()} 
          timeEnd={end instanceof Date ? end : new Date()}
        />;
      case "poll":
        return <PollEditor
          id={id} 
          timeStart={start instanceof Date ? start : new Date()} 
          timeEnd={end instanceof Date ? end : new Date()} 
        />;
      case "quiz":
        return <QuizEditor 
          id={id} //add time to quizeditor
          timeStart={start instanceof Date ? start : new Date()} 
          timeEnd={end instanceof Date ? end : new Date()} 
        />;
      case "raffle":
        return <RaffleEditor />;
      default:
        return <div>Select an activity to get started!</div>;
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
