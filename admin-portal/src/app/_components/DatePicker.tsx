"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CalendarIcon from "../_styles/_images/calendar.svg";
import PrevIcon from "../_styles/_images/previous.svg";
import NextIcon from "../_styles/_images/next.svg";
import "../_styles/DateTimePickers.css";

interface DatePickerProps {
  start: Date;
  end: Date;
  onChange: (result: { newStart: Date, newEnd: Date }) => void;
  label?: string;
}

export default function DatePicker({ start, end, onChange, label }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(start));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dateSelect') && !target.closest('.calendarPopup')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const offset = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const newStart = new Date(date);
    newStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
    const duration = end.getTime() - start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);
    onChange({ newStart, newEnd });
    setShowCalendar(false);
  };

  return (
    <div className="controlGroup">
      {label && (
        <>
          <Image src={CalendarIcon} alt="Calendar" className="calendarIcon" />
          <label>{label}</label>
        </>
      )}
      <div 
        className="dateSelect" 
        onClick={(e) => {
          e.stopPropagation();
          setShowCalendar(true);
        }}
      >
        <span>
          {start.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </span>
        <span className="dropdownArrow">▼</span>
      </div>
      {showCalendar && (
        <div className="calendarPopup" onClick={e => e.stopPropagation()}>
          <div className="calendarHeader">
            <span>
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <div className="calendarHeaderButtons">
              <button className="calendarNavButton" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                <Image src={PrevIcon} alt="Previous" />
              </button>
              <button className="calendarNavButton" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                <Image src={NextIcon} alt="Next" />
              </button>
            </div>
          </div>
          <div className="calendarDays">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
              <div key={day} className="dayHeader">{day}</div>
            ))}
          </div>
          <div className="calendarGrid">
            {generateCalendarDays().map((date, index) => (
              <button
                key={index}
                className={`day ${date && date.toDateString() === start.toDateString() ? 'selected' : ''}`}
                onClick={() => date && handleDateSelect(date)}
                disabled={!date}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 