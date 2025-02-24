"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
interface Message {
  eventID: string;
  _id: number;
  content: { text: string }[];
}
interface AnnouncementEditorProps {
  id: string;
  timeStart: Date;
  timeEnd: Date;
}

export default function AnnouncementEditor({ id, timeStart, timeEnd }: AnnouncementEditorProps) {
  const [message, setMessage] = useState<Message | null>(null);

  const fetchAnnounce = async () => {
    try {
      const { data } = await axios.post(
        `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/filtered`,
        {
          eventID: id,
          type: "announcement",
        }
      );

      if (data.data.length > 0) {
        setMessage({
          ...data.data[0],
          content: data.data[0].content.length ? data.data[0].content : [{ text: "" }],
        });
      } else {
        setMessage({ eventID: id, _id: 0, content: [{ text: "" }] });
      }
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };

  useEffect(() => {
    fetchAnnounce();
  }, []);

  const handleAddText = () => {
    if (!message) return;
    setMessage((prevMessage) =>
      prevMessage
        ? {
            ...prevMessage,
            content: [...prevMessage.content, { text: "" }],
          }
        : null
    );
  };

  const handleUpdateText = (index: number, value: string) => {
    if (!message) return;
    setMessage((prevMessage) =>
      prevMessage
        ? {
            ...prevMessage,
            content: prevMessage.content.map((t, i) =>
              i === index ? { ...t, text: value } : t
            ),
          }
        : null
    );
  };

  const handleDeleteText = async (index: number) => {
    if (!message || !message.content) return; // Ensure message exists before proceeding
  
    // Create a new content array without the deleted text
    const updatedContent = message.content.filter((_, i) => i !== index);
  
    try {
      if (message._id) {
        await axios.patch(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${message._id}`,
          { content: updatedContent }
        );
        console.log("Text successfully deleted from the database!");
      }
    } catch (error) {
      console.error("Error deleting text from the database:", error);
      return;
    }

    setMessage((prevMessage) =>
      prevMessage ? { ...prevMessage, content: updatedContent } : null
    );
  };
  

  const handleSave = async () => {
    if (!message) return;

    try {
      if (message._id) {
        await axios.patch(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${message._id}`,
          { content: message.content }
        );
        console.log("Announcement successfully updated!");
      } else {
        const { data } = await axios.post(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
          {
            eventID: message.eventID,
            type: "announcement",
            content: message.content,
            timeStart,
            timeEnd,
            active: true,
          }
        );
        console.log("New announcement created:", data);
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  return (
    <div>
      {message && message.content.map((textObj, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <textarea
            value={textObj.text}
            onChange={(e) => handleUpdateText(index, e.target.value)}
            placeholder="Add a message"
            rows={2}
            style={{ width: "100%", resize: "none" }}
          />
          <div style={{ marginTop: "5px" }}>
            <button type="button" onClick={() => handleDeleteText(index)}>Delete</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddText}>
        Add Text
      </button>
      <button type="button" onClick={handleSave} style={{ marginLeft: "10px" }}>
        Save
      </button>
    </div>
  );
}