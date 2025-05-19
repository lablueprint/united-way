"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ClockIcon from "../_styles/_images/clock.svg";
import "../_styles/DateTimePickers.css";

interface TimePickerProps {
  startTime: Date;
  endTime?: Date;
  onStartTimeChange: (hours: number, minutes: number) => void;
  onEndTimeChange?: (hours: number, minutes: number) => void;
  showLabel?: boolean;
}

export default function TimePicker({ 
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  showLabel = true
}: TimePickerProps) {
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedStartHour, setSelectedStartHour] = useState(startTime.getHours());
  const [selectedStartMinute, setSelectedStartMinute] = useState(startTime.getMinutes());
  const [isStartPM, setIsStartPM] = useState(startTime.getHours() >= 12);
  
  const [selectedEndHour, setSelectedEndHour] = useState(endTime?.getHours() ?? 0);
  const [selectedEndMinute, setSelectedEndMinute] = useState(endTime?.getMinutes() ?? 0);
  const [isEndPM, setIsEndPM] = useState(endTime?.getHours() ?? 0 >= 12);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.timeSelect') && !target.closest('.timePickerPopup')) {
        setShowStartTimePicker(false);
        setShowEndTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const hours = startTime.getHours();
    setSelectedStartHour(hours);
    setSelectedStartMinute(startTime.getMinutes());
    setIsStartPM(hours >= 12);
  }, [startTime]);

  useEffect(() => {
    if (endTime) {
      const hours = endTime.getHours();
      setSelectedEndHour(hours);
      setSelectedEndMinute(endTime.getMinutes());
      setIsEndPM(hours >= 12);
    }
  }, [endTime]);

  const generateHourOptions = () => {
    const options = [];
    for (let hour = 1; hour <= 12; hour++) {
      options.push({
        value: hour,
        label: hour.toString()
      });
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let minute = 0; minute < 60; minute++) {
      options.push({
        value: minute,
        label: minute.toString().padStart(2, '0')
      });
    }
    return options;
  };

  const handleTimeSelect = (isStart: boolean, hour?: number, minute?: number, newIsPM?: boolean) => {
    if (isStart) {
      let newHour = hour ?? selectedStartHour;
      const newMinute = minute ?? selectedStartMinute;
      const periodIsPM = newIsPM ?? isStartPM;

      if (newHour === 12) {
        newHour = periodIsPM ? 12 : 0;
      } else {
        newHour = periodIsPM ? newHour + 12 : newHour;
      }

      onStartTimeChange(newHour, newMinute);
      setIsStartPM(periodIsPM);
    } else if (onEndTimeChange) {
      let newHour = hour ?? selectedEndHour;
      const newMinute = minute ?? selectedEndMinute;
      const periodIsPM = newIsPM ?? isEndPM;

      if (newHour === 12) {
        newHour = periodIsPM ? 12 : 0;
      } else {
        newHour = periodIsPM ? newHour + 12 : newHour;
      }

      onEndTimeChange(newHour, newMinute);
      setIsEndPM(periodIsPM);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')}`;
  };

  const getPeriod = (date: Date) => {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  };

  const get12Hour = (hour24: number) => {
    if (hour24 === 0) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };

  const renderTimePicker = (isStart: boolean) => {
    const showPicker = isStart ? showStartTimePicker : showEndTimePicker;
    const selectedHour = isStart ? selectedStartHour : selectedEndHour;
    const selectedMinute = isStart ? selectedStartMinute : selectedEndMinute;
    const isPM = isStart ? isStartPM : isEndPM;
    const time = isStart ? startTime : endTime;

    if (!time || (!isStart && !onEndTimeChange)) return null;

    return (
      <div className={`timePickerContainer ${isStart ? 'start' : 'end'}`}>
        <div 
          className="timeSelect" 
          onClick={(e) => {
            e.stopPropagation();
            if (isStart) {
              setShowStartTimePicker(true);
              setShowEndTimePicker(false);
            } else {
              setShowEndTimePicker(true);
              setShowStartTimePicker(false);
            }
          }}
        >
          <span className="timeDisplay">
            <span className="timeValue">{formatTime(time)}</span>
            <span className="timePeriod">{getPeriod(time)}</span>
          </span>
          <span className="dropdownArrow">▼</span>
        </div>
        {showPicker && (
          <div className="timePickerPopup" onClick={e => e.stopPropagation()}>
            <div className="periodToggle">
              <button 
                className={`periodButton ${!isPM ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(isStart, undefined, undefined, false)}
              >
                AM
              </button>
              <button 
                className={`periodButton ${isPM ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(isStart, undefined, undefined, true)}
              >
                PM
              </button>
            </div>
            <div className="timePickerColumns">
              <div className="timePickerColumn">
                <div className="timePickerColumnHeader">Hour</div>
                <div className="timePickerColumnContent">
                  {generateHourOptions().map((option) => (
                    <button
                      key={option.value}
                      className={`timeOption ${option.value === get12Hour(selectedHour) ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(isStart, option.value)}
                    >
                      <span className="timeOptionValue">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="timePickerColumn">
                <div className="timePickerColumnHeader">Minute</div>
                <div className="timePickerColumnContent">
                  {generateMinuteOptions().map((option) => (
                    <button
                      key={option.value}
                      className={`timeOption ${option.value === selectedMinute ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(isStart, undefined, option.value)}
                    >
                      <span className="timeOptionValue">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="controlGroup">
      {showLabel && (
        <>
          <Image src={ClockIcon} alt="Clock" width={24} height={24} />
          <label>Schedule Time</label>
        </>
      )}
      <div className="timeRangeSelect">
        {renderTimePicker(true)}
        {endTime && onEndTimeChange && (
          <>
            <span className="timeRangeSeparator">-</span>
            {renderTimePicker(false)}
          </>
        )}
      </div>
    </div>
  );
} 