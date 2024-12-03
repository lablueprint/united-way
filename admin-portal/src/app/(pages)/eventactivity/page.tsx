"use client"
import React, { useState } from 'react';
import AnnouncementEditor from '@/app/_components/announcement';

function PollEditor() {
  return <div>Poll Editor: Create your poll questions here!</div>;
}

function QuizEditor() {
  return <div>Quiz Editor: Add quiz questions and answers here!</div>;
}

function RaffleEditor() {
  return <div>Raffle Editor: Set up your raffle details here!</div>;
}

export default function EventActivity() {
  const [activityType, setActivityType] = useState("");

  const renderEditor = () => {
    switch (activityType) {
      case "announcement":
        return <AnnouncementEditor />;
      case "poll":
        return <PollEditor />;
      case "quiz":
        return <QuizEditor />;
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
    </div>
  );
}