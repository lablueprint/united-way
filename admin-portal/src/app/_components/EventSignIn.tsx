"use client"
import "./EventSignIn.css";
import React, { useState } from 'react';
import QRCode from 'react-qr-code';

export default function EventDetailsPage() {
  const [eventId, setEventId] = useState("");
  const [eventDetails, setEventDetails] = useState({
    id: "",
    name: "",
    description: "",
    org: "",
  });

  const handleGenerateQRCode = () => {
    // Simulate fetching event details using the entered event ID
    const fetchedDetails = {
      id: eventId,
      name: `Event for ${eventId}`,
      description: `Description for event ${eventId}`,
      org: "Sample Organization",
    };
    setEventDetails(fetchedDetails);
  };

  return (
    <div className="qr-code-align">
      <h1>Event QR Code Generator</h1>
      <input
        type="text"
        placeholder="Enter Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          marginBottom: "10px",
          width: "60%",
        }}
      />
      <br />
      <button onClick={handleGenerateQRCode}>
        Generate QR Code
      </button>

      {eventDetails && (
        <div>
          <h2>{eventDetails.name}</h2>
          <p>{eventDetails.description}</p>
          <p>Organized by: {eventDetails.org}</p>
          <QRCode value={eventDetails.id} />
        </div>
      )}
    </div>
  );
}
