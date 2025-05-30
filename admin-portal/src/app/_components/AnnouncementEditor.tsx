"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../_styles/AnnouncementModal.css";
import ClockIcon from "../_styles/_images/clock.svg";
import Image from "next/image";

interface Announcement {
  title: string;
  text: string;
}

interface AnnouncementEditorProps {
  activityId: string;
  timeStart: Date;
  onCancel?: () => void;
  onTimeUpdate?: (newStart: Date, newEnd: Date) => void;
}

export default function AnnouncementEditor({ 
  activityId, 
  timeStart,
  onCancel,
  onTimeUpdate 
}: AnnouncementEditorProps) {
  const [announcement, setAnnouncement] = useState<Announcement>({ title: "", text: "" });
  const [scheduledTime, setScheduledTime] = useState<string>(
    timeStart.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    // Fetch existing announcement data if editing
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`
        );
        const data = response.data.data;
        if (data.content) {
          setAnnouncement({
            title: data.content.title || "",
            text: data.content.text || ""
          });
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };

    if (activityId) {
      fetchAnnouncement();
    }
  }, [activityId]);

  const handleSave = async () => {
    try {
      const newStart = new Date(timeStart);
      const [hours, minutes] = scheduledTime.split(':');
      newStart.setHours(parseInt(hours), parseInt(minutes));

      const newEnd = new Date(newStart);
      newEnd.setMinutes(newEnd.getMinutes() + 5); // 5 minute duration for announcements

      // Update the activity with title and message in content object
      await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        {
          content: {
            title: announcement.title,
            text: announcement.text
          },
          timeStart: newStart,
          timeEnd: newEnd
        }
      );

      onTimeUpdate?.(newStart, newEnd);
      onCancel?.();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent announcementModalContent">
        <div className="announcementHeader">ADD ANNOUNCEMENT</div>
        <div className="announcementFieldLabel">TITLE</div>
        <input
          className="announcementInput"
          placeholder="TITLE"
          value={announcement.title}
          onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
        />
        <div className="announcementFieldLabel">DESCRIPTION</div>
        <textarea
          className="announcementTextarea"
          placeholder="Description"
          value={announcement.text}
          onChange={e => setAnnouncement({ ...announcement, text: e.target.value })}
        />
        <div className="announcementScheduleRow">
          <Image src={ClockIcon} alt="Clock" width={20} height={20} />
          <span className="announcementScheduleLabel">SCHEDULE TIME</span>
          <div className="announcementTimeInputContainer">
            <input 
              className="announcementTimeInput" 
              type="time" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>
        <div className="announcementButtonRow">
          <button className="announcementCancelButton" onClick={onCancel}>CANCEL</button>
          <button className="announcementPublishButton" onClick={handleSave}>PUBLISH</button>
        </div>
      </div>
    </div>
  );
}