"use client"
import React, { useState } from 'react';

export default function AnnouncementEditor() {
  const [messages, setMessages] = useState<string[]>([""]);

  // Add a new message segment
  const handleAddMessage = () => {
    setMessages([...messages, ""]);
  };

  // Update a specific message segment
  const handleUpdateMessage = (index: number, value: string) => {
    const updatedMessages = [...messages];
    updatedMessages[index] = value;
    setMessages(updatedMessages);
  };

  // Delete a specific message segment
  const handleDeleteMessage = (index: number) => {
    const updatedMessages = messages.filter((_, i) => i !== index);
    setMessages(updatedMessages);
  };

  return (
    <div>
      <h3>Announcement Editor</h3>
      {messages.map((message, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <textarea
            value={message}
            onChange={(e) => handleUpdateMessage(index, e.target.value)}
            placeholder={`Message segment ${index + 1}`}
            rows={2}
            style={{ width: "100%", resize: "none" }}
          />
          <div style={{ marginTop: "5px" }}>
            <button onClick={() => handleDeleteMessage(index)}>Delete</button>
          </div>
        </div>
      ))}
      <button onClick={handleAddMessage}>Add Message</button>
      <h4>Preview:</h4>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg || `(Message ${index + 1} is empty)`}</li>
        ))}
      </ul>
    </div>
  );
}