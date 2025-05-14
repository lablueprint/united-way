"use client";
import React, { useState, useEffect } from "react";

import useApiAuth from "../_hooks/useApiAuth";
import { RequestType } from "../_interfaces/RequestInterfaces";

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
  const [org, sendRequest] = useApiAuth();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const activityData = await getActivityById(activityId);
      setAnnouncements(activityData.content.length > 0 ? activityData.content : [{ text: "" }]);
    };
    fetchAnnouncements();
  }, [activityId]);

  const getActivityById = async (activityId: string) => {
    try {
      const body = {};
      const endpoint = `activities/${activityId}`;
      const requestType = RequestType.GET;
      return await sendRequest({ body, endpoint, requestType });
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
      const body = {
        content: announcements,
        timeStart,
        timeEnd
      };
      const endpoint = `activities/${activityId}`;
      const requestType = RequestType.PATCH;
      await sendRequest({ body, endpoint, requestType });
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