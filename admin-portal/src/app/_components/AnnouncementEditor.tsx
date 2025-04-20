"use client";
import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface Announcement {
  text: string;
}

interface AnnouncementEditorProps {
  activityId: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function AnnouncementEditor({ activityId, timeStart, timeEnd }: AnnouncementEditorProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const activityData = await getActivityById(activityId);
      setAnnouncements(activityData.content.length > 0 ? activityData.content : [{ text: "" }]);
    };
    fetchAnnouncements();
  }, [activityId]);

  const getActivityById = async (activityID: string) => {
    try {
      const response: AxiosResponse = await axios.get(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityID}`
      );
      return response.data.data;
    } catch (err) {
      console.log(err);
      return { content: [] };
    }
  };

  const handleTextChange = (index: number, newText: string) => {
    const updated = [...announcements];
    updated[index].text = newText;
    setAnnouncements(updated);
    setIsModified(true);
  };

  const addAnnouncement = () => {
    setAnnouncements([...announcements, { text: "" }]);
    setIsModified(true);
  };

  const deleteAnnouncement = (index: number) => {
    if (announcements.length === 1) return; 
    const updated = announcements.filter((_, i) => i !== index);
    setAnnouncements(updated);
    setIsModified(true);
  };

  const saveAnnouncements = async () => {
    try {
      await axios.patch(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${activityId}`,
        { content: announcements, timeStart, timeEnd }
      );
      setIsModified(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h3>Announcements</h3>
      {announcements.map((announcement, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <textarea
            name="text"
            placeholder="Enter announcement text"
            value={announcement.text}
            onChange={(event) => handleTextChange(index, event.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
          <button onClick={() => deleteAnnouncement(index)} disabled={announcements.length === 1}>
            Delete
          </button>
        </div>
      ))}
      <button type="button" onClick={addAnnouncement}>
        Add
      </button>
      <button type="button" onClick={saveAnnouncements} disabled={!isModified}>
        Save
      </button>
    </div>
  );
}