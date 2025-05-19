"use client";
import React from 'react';
import Image from 'next/image';
import ClockIcon from "../_styles/_images/clock.svg";
import "../_styles/DateTimePickers.css";

interface TimePickerProps {
  start: Date;
  end: Date;
  onChange: (result: { newStart: Date; newEnd: Date }) => void;
  label?: string;
}

export default function TimePicker({ start, end, onChange, label }: TimePickerProps) {
  // Format for input type="time" (HH:MM)
  const getTimeString = (date: Date) =>
    `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  // When start time changes, preserve duration
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hour, minute] = e.target.value.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) return;

    const newStart = new Date(start.getFullYear(), start.getMonth(), start.getDate(), hour, minute, 0, 0);
    const duration = end.getTime() - start.getTime();
    let newEnd = new Date(newStart.getTime() + duration);

    if (duration < 0) {
      newEnd.setDate(newEnd.getDate() + 1);
    }

    console.log("Start UTC:", newStart.toISOString());
    console.log("End UTC:", newEnd.toISOString());

    onChange({ newStart, newEnd });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hour, minute] = e.target.value.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) return;

    let newEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate(), hour, minute, 0, 0);

    if (newEnd <= start) {
      newEnd.setDate(newEnd.getDate() + 1);
    }

    console.log("Start UTC:", start.toISOString());
    console.log("End UTC:", newEnd.toISOString());

    onChange({ newStart: start, newEnd });
  };

  return (
    <div className="controlGroup">
      {label && (
        <>
          <Image src={ClockIcon} alt="Clock" width={24} height={24} />
          <label>{label}</label>
        </>
      )}

      <div className="timeRangeSelect">
        <input
          type="time"
          value={getTimeString(start)}
          onChange={handleStartChange}
          style={{ width: 100 }}
        />
        <span className="timeRangeSeparator">-</span>
        <input
          type="time"
          value={getTimeString(end)}
          onChange={handleEndChange}
          style={{ width: 100 }}
        />
      </div>
    </div>
  );
}
