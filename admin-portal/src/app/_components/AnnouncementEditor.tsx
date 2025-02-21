"use client"
import React, { useState } from "react";
import axios from "axios";

interface Message {
  id: number;
  text: string;
}

interface AnnouncementEditorProps {
  id: string;
  // eventID: string;
  // onSave: () => void;
  timeStart: Date;
  timeEnd: Date;
}

export default function AnnouncementEditor({ id, timeStart, timeEnd }: AnnouncementEditorProps) {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "" }]);

  // Add a new message segment with a unique ID
  const handleAddMessage = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: prevMessages.length ? Math.max(...prevMessages.map((m) => m.id)) + 1 : 1,
        text: "",
      },
    ]);
    console.log(messages);
  };

  // Update a specific message segment
  const handleUpdateMessage = (id: number, value: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, text: value } : message
      )
    );
  };

  // Delete a specific message segment
  const handleDeleteMessage = (id: number) => {
    setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
  };

  // Handle saving announcements
  const handleSave = async () => {
    console.log("Saving announcements:", { id, messages });

    try {
      if (id) {
        // If updating an existing announcement
        console.log("Updating existing announcement:", id);

        await axios.patch(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/${id}`,
          { content: messages.map((m) => m.text) }
        );

        console.log("Announcement successfully updated!");
      } else {
        // If creating a new announcement
        console.log("Creating a new announcement...");

        const { data } = await axios.post(
          `http://${process.env.IP_ADDRESS}:${process.env.PORT}/activities/createActivity`,
          {
            id,
            type: "announcement",
            content: messages.map((m) => m.text),
            timeStart: {timeStart},
            timeEnd: {timeEnd},
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
      <h3>Announcement Editor</h3>
      {messages.map((message) => (
        <div key={message.id} style={{ marginBottom: "10px" }}>
          <textarea
            value={message.text}
            onChange={(e) => handleUpdateMessage(message.id, e.target.value)}
            placeholder={`Message segment ${message.id}`}
            rows={2}
            style={{ width: "100%", resize: "none" }}
          />
          <div style={{ marginTop: "5px" }}>
            <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
            <button onClick={handleAddMessage}>Add Message</button>
            <button onClick={handleSave} style={{ marginLeft: "10px" }}>Save</button>
          </div>
        </div>
      ))}
      {/* <button onClick={handleAddMessage}>Add Message</button> */}
      
    </div>
  );
}

//i need to fetch the announcements and then find the announcement id, the {id} right now is currently 
// the eventid and its checking if the eventid already exists but i want to edit the announcement